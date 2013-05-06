
var App = {

  animables: [], // list of objects need to be updated and rendered
  old_time: 0,
  time: 0,

  init_time: 0,
  last_time: 1419,

  clicked: false,
  stopped: false,

  initialize: function(options) {
    var self = this;

    this._initTestData();

    this.options = options;
    this.options.scale = 2.0
    this.map = new Map('map', {
      zoomControl: false,
      scrollWheelZoom: false,
      center: [51.511214,  -0.100824], // london
      zoom: 12,
      base_layer: 'https://saleiva.cartodb.com/tiles/here_osm_madrid/{z}/{x}/{y}.png'
    });

    Bubbles.initialize(this.map.map);
    this.animables.push(Bubbles);

    this.carrousel = new Carrousel(
      $('.cities_nav')
    );
    
    this.slider = new Slider($('#slider'), {
      timeMin: new Date(this.init_time).getTime(),
      timeRange: (this.last_time - this.init_time) * 1
    });

    this.slider.onTimeChange = function(time) {
      self.time = time;
    }

    this.animables.push(this.map, this.slider);
    this._tick = this._tick.bind(this);
    requestAnimationFrame(this._tick);

    if(location.search.indexOf('debug') != -1)
      setTimeout(function() {
        self.add_debug();
      }, 4000);
  },

  _initTestData: function() {
    var data = [];
    Bubbles.data.fetch();
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
    dt = this.options.scale*this.options.time_scale*Math.min(1, dt);
    this.old_time = t0;

    if(!stopped && !clicked){
      this.time += dt;
      for(var i = 0; i < animables.length; ++i) {
        var a = animables[i];
        a.set_time(this.time);
        a.render();
      }
    }

    if(this.time/60 > this.last_time) {
      this.time = 0;
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
    f2.add(ro, 'exp_decay', 0, 20).onChange(this.map.probsLayer.precache_sprites)
    f2.add(ro, 'part_type', ['sphere', 'glow']).onChange(this.map.probsLayer.precache_sprites)
    f2.addColor(ro, 'part_color').onChange(this.map.probsLayer.precache_sprites)
    f2.open();

    var post = gui.addFolder('Postprocess');
    post.add(ro, 'post_alpha', 0, 1)
    post.add(ro, 'post_decay', 0, 1)
    post.add(ro, 'post_size', [64, 128, 256, 512, 1024]).onChange(this.map.probsLayer.init_post_process)
    post.add(ro, 'post_process')
    post.open()
  }
};

