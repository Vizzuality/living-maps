
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.requestAnimationFrame;


var App = {

  initialize: function() {
    this.map = L.map('map').setView(
      [51.511214,  -0.100824] // london
    , 12);
    this.map.keyboard.disable();

    this.addStreetLayer();
    this.render = this.render.bind(this);
    this.initControls();
    this.t = 0;
    this.speed = 0.5
    this.old_time = Date.now();
    this.time = document.getElementById('date');
    var self = this;


    this.add_debug()

  },
  
  add_debug: function() {
    var gui = new dat.GUI();
    var ro = this.layer.render_options
    gui.remember(this);
    gui.remember(ro);
    gui.add(this, 'speed', 0, 3)
    gui.add(ro, 'filtered')

    var f2 = gui.addFolder('particles');
    f2.add(ro, 'part_min_size', 0.2, 40).onChange(this.layer.precache_sprites)
    f2.add(ro, 'part_inc', 0, 70).onChange(this.layer.precache_sprites)
    f2.add(ro, 'min_alpha', 0, 0.3).onChange(this.layer.precache_sprites)
    f2.add(ro, 'alpha_inc', 0, 0.5).onChange(this.layer.precache_sprites)
    f2.add(ro, 'exp_decay', 0, 20).onChange(this.layer.precache_sprites)
    f2.addColor(ro, 'part_color').onChange(this.layer.precache_sprites)
    f2.open();

    var post = gui.addFolder('Postprocess');
    post.add(ro, 'post_alpha', 0, 1)
    post.add(ro, 'post_decay', 0, 1)
    post.add(ro, 'post_size', [64, 128, 256, 512, 1024]).onChange(this.layer.init_post_process)
    post.add(ro, 'post_process')
    post.open()
  },

  set_date: function() {
     var real_time = this.t/60 + this.layer.options.start_date;
     var date = new Date(real_time * 1000);
     var date_arry = date.toString().substr(4).split(' ');
     var pad = "00"
     var mins = Math.floor(real_time%60) + "";
     this.time.innerHTML = 
     Math.floor(real_time/60) + ':' + pad.substring(0, 2 - mins.length) + mins ;
  },

  render: function() {
    var t0 = Date.now();
    var dt = 0.001 * (t0 - this.old_time); // seconds
    this.t += dt*this.speed*15*60; //15 minutes each second
    var otime = this.layer.time;
    this.layer.set_time(this.t)
    if ( this.layer.time != otime ) {
      this.old_time = t0;
      this.layer._render(0.02);
    }
    this.set_date();
    /*if(this.controls.left) {
      this.t = Math.max(0, this.t - 1);
      this.layer.set_time(this.t);
      this.time.innerHTML = this.t;
    } else if(this.controls.right) {
      this.t++;
      this.layer.set_time(this.t);
      this.time.innerHTML = this.t;
    }*/
    requestAnimationFrame(this.render);
    if(this.t/60 + this.layer.options.start_date > this.layer.options.end_date) {
      this.t = 0;
    }
  },

  addStreetLayer: function() {
    var self = this;
    this.layer = new StreetLayer();
    cartodb.createLayer(this.map, 
      'http://pulsemaps.cartodb.com/api/v1/viz/rds_s/viz.json'
    ).done(function(layer) {
      self.map.addLayer(layer)
      self.map.addLayer(self.layer);
      requestAnimationFrame(self.render);
    });
    //this.layer = new StreetLayerDensity();
  },

  initControls: function() {
    var controls = this.controls = {
      left: false,
      right: false,
      fire: false,
      up: false,
      down: false
    };
    window.addEventListener('keyup', function(e) { key(e, false); });
    window.addEventListener('keydown', function(e) { key(e, true);});
    function key(e, w) {
      if(e.keyCode == 38) {      controls.up= w; }
      else if(e.keyCode == 40) { controls.down = w; }
      else if(e.keyCode == 37) { controls.left = w; } 
      else if(e.keyCode == 39) { controls.right= w; } 
      else if(e.keyCode == 32) { controls.fire = w; }
    };
  }

}

