
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
    this.map = L.map(this.el, this.options)
      .setView(this.options.center, this.options.zoom);

    this._addLayers();
  },

  _addLayers: function() {
    var self = this;
    // base layer
    L.tileLayer(this.options.base_layer).addTo(this.map);
    cartodb.createLayer(this.map, 
      'http://pulsemaps.cartodb.com/api/v1/viz/rds_s/viz.json'
    ).done(function(layer) {
      self.map.addLayer(layer)
      self.map.addLayer(this.probsLayer);
    });
    this.probsLayer = new StreetLayer();
  },

  set_time: function(t) {
    this.probsLayer.set_time(t);
  },

  render: function() {
    this.probsLayer._render();
  }

};
