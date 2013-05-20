var App = {

  animables: [], // list of objects need to be updated and rendered
  old_time: 0,
  time: 0,

  init_time: window.AppData.init_time,
  last_time: window.AppData.last_time,

  vendorHidden: "",
  vendorVisibilitychange: "",
  isPlayed: false,

  initialize: function(options) {
    var self = this;

    this.options = _.extend({}, options);

    this.map = new Map('map', {
      zoomControl: false,
      scrollWheelZoom: false,
      center: this.options.map.center,
      zoom: this.options.map.zoom,
      minZoom: this.options.map.minZoom,
      maxZoom: this.options.map.maxZoom,
      // scrollWheelZoom: false,
      // doubleClickZoom: false,
      base_layer: 'https://saleiva.cartodb.com/tiles/'+ this.options.map.name +'/{z}/{x}/{y}.png',
      city: this.options.city
    });

    // Home
    Home.initialize();

    // Mamufas
    this.mamufas = new Mamufas($('#mamufas'), this.options.city);

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
    });

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

    if(location.search.indexOf('debug') != -1)
      setTimeout(function() {
        self.add_debug();
      }, 4000);

    Events.trigger("disableanimation", self.options.city, self.options.time);
  },

  _initBindings: function() {
    var self = this;

    Events.on('finish_loading', function() {
      Events.trigger("stopanimation");
    });
    Events.on("enableanimation", this._onEnableAnimation, this);
    Events.on("disableanimation", this._onDisableAnimation, this);
    Events.on("stopanimation", this._onStopAnimation, this);
    Events.on("resumeanimation", this._onResumeAnimation, this);
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

  _onStopAnimation: function() {
    stopped = true;
    $(".ui-slider-handle").addClass("stopped");
    if(this.isPlayed) {
      updateHash(this.map.map, this.options.city, App.time);
    }
  },

  _onResumeAnimation: function() {
    stopped = false;
    $(".ui-slider-handle").removeClass("stopped");

    updateHash(this.map.map, this.options.city, window.AppData.init_time);
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
      var real_time = this.time + this.options.time_offset*60;
      if(real_time < 0) real_time += this.last_time*60;
      real_time = fmod(real_time, this.last_time*60);
      for(var i = 0; i < animables.length; ++i) {
        var a = animables[i];
        a.set_time(real_time);
        a.render();
      }
    } else if (dragged) {
      for(var i = 0; i < animables.length; ++i) {
        var a = animables[i];
        a.set_time(real_time);
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
    this.isPlayed = false;

    dragged = false;
    clicked = false;
    stopped = true;

    _.extend(this.options, options);

    city = this.options.city;

    this.map.set_city(this.options.map.center, this.options.map.zoom, this.options.city);

    // Restart all animated particled
    Bubbles.set_city(this.options.city);
    ContextualFacts.set_city(this.options.city);
    POIS.set_city(this.options.city);

    // Set city in the zoom
    Zoom.set_city(this.options.city);

    Events.trigger("disableanimation", self.options.city, self.options.time);

    Events.on('finish_loading', function() {
      Events.trigger("stopanimation");
    });

  }
};
