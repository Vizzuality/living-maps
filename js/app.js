
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.requestAnimationFrame;


var App = {

  initialize: function() {
    this.map = L.map('map').setView(
      [51.511214,  -0.100824] // london
    , 12);
    this.map.keyboard.disable();
    L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
      attribution: 'Stamen'
    })
    .setOpacity(0.0)
    .addTo(this.map);

    this.addStreetLayer();
    this.render = this.render.bind(this);
    this.initControls();
    this.t = 0;
    this.time = document.getElementById('date');
    requestAnimationFrame(this.render);
    var self = this;
    setInterval(function() {
      self.time.innerHTML = new Date(1000*15*60*self.t++);
      self.layer.set_time(self.t);
    }, 1000)

  },

  render: function() {
    this.layer._render(0.02);
    if(this.controls.left) {
      this.t = Math.max(0, this.t - 1);
      this.layer.set_time(this.t);
      this.time.innerHTML = this.t;
    } else if(this.controls.right) {
      this.t++;
      this.layer.set_time(this.t);
      this.time.innerHTML = this.t;
    }
    requestAnimationFrame(this.render);
  },

  addStreetLayer: function() {
    //this.layer = new StreetLayer();
    this.layer = new StreetLayerDensity();
    this.map.addLayer(this.layer);
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

