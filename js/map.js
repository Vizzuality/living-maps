
/**
 * manages map creation, interations and layers
 */

function Map(el, options) {
  this.el = el;
  this.options = options;
  this.initialize();
}

Map.prototype = {

  // creates the map and add it to the DOM
  initialize: function() {
    this.options.fadeAnimation = false;
    this.map = L.map(this.el, this.options)
      .setView(this.options.center, this.options.zoom);

    this._addLayers();

    this.map.on('click', function(e) {
      var p = e.containerPoint;
      $('.bubble').css({
        top: p.y,
        left: p.x
      });
    });
  },

  _addLayers: function() {
    var self = this;
    // base layer
    cartodb.createLayer(this.map, 
      'http://pulsemaps.cartodb.com/api/v1/viz/rds_s/viz.json', {
        interaction: false
      }
    ).done(function(layer) {
      self.map.addLayer(layer)
      //self.probsLayer = new StreetLayer();
      //self.map.addLayer(self.probsLayer);
    });
  },

  set_time: function(t) {
    if(this.probsLayer) {
      this.probsLayer.set_time(t);
    }
  },

  render: function() {
    if(this.probsLayer) {
      this.probsLayer._render();
    }
  }

};
