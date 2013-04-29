
var App = {

  animables: [], // list of objects need to be updated and rendered
  old_time: 0,
  time: 0,

  initialize: function(options) {
    this.options = options;
    this.map = new Map('map', {
      zoomControl: false,
      scrollWheelZoom: false,
      center: [51.511214,  -0.100824], // london
      zoom: 12,
      base_layer: 'https://saleiva.cartodb.com/tiles/here_osm_madrid/{z}/{x}/{y}.png'
    });

    this.carrousel = new Carrousel(
      $('.cities_nav')
    );

    this.animables.push(this.map);
    this._tick = this._tick.bind(this);
    requestAnimationFrame(this._tick);

    if(location.search.indexOf('debug') != -1)
      this.add_debug();
  },

  _tick: function() {
    this.tick();
    requestAnimationFrame(this._tick);
  },

  tick: function() {
    var animables = this.animables;
    // update time
    var t0 = new Date().getTime()  
    var dt = 0.001*(t0 - this.old_time)
    dt = this.options.time_scale*Math.min(1, dt);
    this.old_time = t0;
    this.time += dt;
    for(var i = 0; i < animables.length; ++i) {
      var a = animables[i];
      a.set_time(this.time);
      //a.update(dt);
      a.render();
    }
  },

  add_debug: function() {
    var gui = new dat.GUI();
    var ro = this.map.probsLayer.render_options
    //gui.remember(this);
    //gui.remember(ro);
    gui.add(this.options, 'time_scale', 0, 150)
    gui.add(ro, 'filtered')

    var f2 = gui.addFolder('particles');
    f2.add(ro, 'part_min_size', 0.2, 40).onChange(this.map.probsLayer.precache_sprites)
    f2.add(ro, 'part_inc', 0, 70).onChange(this.map.probsLayer.precache_sprites)
    f2.add(ro, 'min_alpha', 0, 0.3).onChange(this.map.probsLayer.precache_sprites)
    f2.add(ro, 'alpha_inc', 0, 0.5).onChange(this.map.probsLayer.precache_sprites)
    f2.add(ro, 'exp_decay', 0, 20).onChange(this.map.probsLayer.precache_sprites)
    f2.addColor(ro, 'part_color').onChange(this.map.probsLayer.precache_sprites)
    f2.open();

    var post = gui.addFolder('Postprocess');
    post.add(ro, 'post_alpha', 0, 1)
    post.add(ro, 'post_decay', 0, 1)
    post.add(ro, 'post_size', [64, 128, 256, 512, 1024]).onChange(this.map.probsLayer.init_post_process)
    post.add(ro, 'post_process')
    post.open()
  },


};

