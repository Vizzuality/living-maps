var App = {

  animables: [], // list of objects need to be updated and rendered
  old_time: 0,
  time: 0,

  init_time: window.AppData.init_time,
  last_time: window.AppData.last_time,

  vendorHidden: "",
  vendorVisibilitychange: "",
  isLoaded: false,
  isPlayed: false,

  initialize: function(options) {
    var self = this;

    this.options = _.extend({}, options);

    var reduction = isSlowBrowser ?
      (this.options.reductionSlowBrowser || 0):
      0;

    this.map = new Map('map', {
      zoomControl: false,
      scrollWheelZoom: false,
      center: this.options.map.center,
      zoom: this.options.map.zoom,
      minZoom: this.options.map.minZoom,
      maxZoom: this.options.map.maxZoom,
      // scrollWheelZoom: false,
      // doubleClickZoom: false,
      city: this.options.city,
      time_offset: this.options.time_offset,
      reduction: reduction,
      use_web_worker: isWebWorkers
    });

    // Mamufas
    this.mamufas = new Mamufas($('.mamufas'), this.map.map, this.options.city);

    // Navigation
    this.navigation = new Navigation($('#cities_dropdown'), this.options.city);

    // ****
    // Map animated particled
    // ****

    // Slider
    this.slider = new Slider($('#time_slider'), {
      timeMin: new Date(this.init_time).getTime(),
      timeRange: (this.last_time - this.init_time) * 1,
      map: this.map.map,
      city: this.options.city
    }, this.map.map, this.options.city);

    // Sound
    this.sounds = [];
    this.howls = {};

    _.each(window.AppData.CITIES, function(city) {
      self.sounds.push(city.city);
    });

    for (var i=0; i<this.sounds.length; i++) {
      this.howls[this.sounds[i]] = new Howl({
        urls: ['sounds/' + this.sounds[i] + '.mp3'],
        // volume: '0',
        loop: true
      });
    }

    // Set map controls
    Zoom.initialize(this.map.map, this.options.city);

    // Bubbles
    Bubbles.initialize(this.map.map, this.options.city);

    // Contextual facts
    ContextualFacts.initialize(this.map.map, this.options.city);

    // City POIS
    POIS.initialize(this.map.map, this.options.city);

    // Share dialog
    Share.initialize();

    this._initBindings();
    
    this.animables.push(this.map, this.slider, Bubbles, ContextualFacts);
    this._tick = this._tick.bind(this);
    requestAnimationFrame(this._tick);

    if(isDebug)
      setTimeout(function() {
        self.add_debug();
      }, 4000);

    if(this.options.time != 0) {
      Events.trigger("disableanimation", this.map.map, this.options.city, this.options.time);
    }

    Events.on('finish_loading', function() {
      self.isLoaded = true;
      Events.trigger("stopanimation");
    });
  },

  _initBindings: function() {
    var self = this;

    Events.on("enableanimation", this._onEnableAnimation, this);
    Events.on("disableanimation", this._onDisableAnimation, this);
    Events.on("resumeanimation", this._onResumeAnimation, this);
    Events.on("stopanimation", this._onStopAnimation, this);
    Events.on("stopsounds", this._onStopSounds, this);
    Events.on("changevol", this._onChangeVol, this);
    Events.on("toggledropdowns", function(mamufas) {
      if(!mamufas) {
        // fake stop animation when disable mamufas
        stopped = true;
        $(".ui-slider-handle").addClass("stopped");
      }
    });

    Events.on("changetime", function(time) {
      self.time = time >> 0;
    });
    Events.on("changeappscale", function(scale) {
      this.options.scale = scale || 2.0;
    }, this);
  },

  _onEnableAnimation: function() {
    Events.off('finish_loading');
    this.isPlayed = true;

    if (this.detectHiddenFeature()) {
      document.addEventListener(this.vendorVisibilitychange, this.visibilityChanged);
    }

    $(document).on("keyup", function(e) {
      if (e.keyCode === 32) {
        if (!stopped && !Share.visible()) {
          Events.trigger("stopanimation");
        } else if(!Share.visible()) {
          Events.trigger("resumeanimation");
        }
      }
    });

    Events.trigger("resumeanimation");
  },

  _onDisableAnimation: function() {
    $(document).off("keyup");
  },

  _onResumeAnimation: function() {
    stopped = false;
    //TODO: this should be in slider
    // jquery driven development is shit
    $(".ui-slider-handle").removeClass("stopped");

    this.howls[this.options.city].play();

    updateHash(this.map.map, this.options.city, window.AppData.init_time);
  },

  _onStopAnimation: function() {
    stopped = true;
    //TODO: this should be in slider
    // jquery driven development is shit
    $(".ui-slider-handle").addClass("stopped");

    if(this.isPlayed) {
      this.howls[this.options.city].pause();

      updateHash(this.map.map, this.options.city, App.time);
    }
  },

  _onStopSounds: function(city) {
    this.howls[city].stop();
  },

  _onChangeVol: function(vol) {
    this.howls[city].volume(vol);
  },

  detectHiddenFeature: function() {
    if(typeof document.hidden != "undefined") {
      this.vendorHidden = "hidden";
      this.vendorVisibilitychange = "visibilitychange";
      return true;
    }

    // IE10
    if (typeof document.msHidden != "undefined") {
      this.vendorHidden = "msHidden";
      this.vendorVisibilitychange = "msvisibilitychange";
      return true;
    }

    // Chrome
    if (typeof document.webkitHidden != "undefined") {
      this.vendorHidden = "webkitHidden";
      this.vendorVisibilitychange = "webkitvisibilitychange";
      return true;
    }

    // Page Visibility API not supported
    return false;
  },

  _tick: function() {
    this.tick();
    requestAnimationFrame(this._tick);
  },

  tick: function() {
    var animables = this.animables;

    // update time
    var t0 = new Date().getTime();
    var dt = 0.001*(t0 - this.old_time);
    dt = dt*this.options.scale*this.options.time_scale;
    dt = Math.min(15*60, dt); // dont allow the time advance more than 15 mins
    this.old_time = t0;

    if(!stopped && !clicked){
      this.time += dt;
      if(this.time/60 >= this.last_time) {
        this.time = 0;
      }
      for(var i = 0; i < animables.length; ++i) {
        var a = animables[i];
        a.set_time(this.time);
        a.render();
      }
    } else if (dragged) {
      for(var i = 0; i < animables.length; ++i) {
        var a = animables[i];
        a.set_time(this.time);
        a.render();
      }
    }

  },

  add_debug: function() {
    var gui = new dat.GUI();
    var ro = this.map.probsLayer.render_options
    //gui.remember(this);
    //gui.remember(ro);
    gui.add(this.options, 'scale', 0, 10)
    //gui.add(ro, 'filtered')

    var f2 = gui.addFolder('particles');
    f2.add(ro, 'part_min_size', 0.2, 40).onChange(this.map.probsLayer.precache_sprites)
    f2.add(ro, 'part_inc', 0, 70).onChange(this.map.probsLayer.precache_sprites)
    f2.add(ro, 'min_alpha', 0, 0.3).onChange(this.map.probsLayer.precache_sprites)
    f2.add(ro, 'alpha_inc', 0, 0.5).onChange(this.map.probsLayer.precache_sprites)
    f2.add(ro, 'part_type', ['sphere', 'glow']).onChange(this.map.probsLayer.precache_sprites)
    f2.addColor(ro, 'part_color').onChange(this.map.probsLayer.precache_sprites)
    f2.open();

    var post = gui.addFolder('Postprocess');
    post.add(ro, 'post_alpha', 0, 1)
    post.add(ro, 'post_decay', 0, 1)
    post.add(ro, 'post_size', [64, 128, 256, 512, 1024]).onChange(this.map.probsLayer.init_post_process)
    post.add(ro, 'post_process')
    post.open()
  },

  restart: function(options) {
    var self = this;

    // restart variables
    this.old_time = 0;
    this.time = 0;
    this.isLoaded = false;
    this.isPlayed = false;

    dragged = false;
    clicked = false;
    stopped = true;

    _.extend(this.options, options);

    city = this.options.city;

    this.map.map.options.minZoom = this.options.map.minZoom;
    this.map.map.options.maxZoom = this.options.map.maxZoom;
    
    var reduction = isSlowBrowser ?
        (this.options.reductionSlowBrowser || 0):
        0;

    this.map.set_city(this.options.map.center, this.options.map.zoom, this.options.city, this.options.time_offset, reduction);

    // Restart all animated particled
    Bubbles.set_city(this.options.city);
    ContextualFacts.set_city(this.options.city);
    POIS.set_city(this.options.city);

    // Set city in the zoom
    Zoom.set_city(this.options.city, self.map.map);

    // Set city in the slider
    this.slider.set_city(this.options.city, self.map.map);

    Events.trigger("disableanimation", self.map.map, self.options.city, self.options.time);

    Events.on('finish_loading', function() {
      self.isLoaded = true;
      Events.trigger("stopanimation");
    });
  }
};
