
var App = {

  animables: [], // list of objects need to be updated and rendered
  old_time: 0,

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
    for(var i = 0; i < animables.length; ++i) {
      var a = animables[i];
      a.update(dt);
      a.render();
    }
  }

};

