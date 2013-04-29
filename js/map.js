
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
    // base layer
    L.tileLayer(this.options.base_layer).addTo(this.map);
    this.probsLayer = new StreetLayer();
    this.map.addLayer(this.probsLayer);
  },

  update: function(dt) {
    this.probsLayer.update(dt);
  },

  render: function() {
    this.probsLayer._render();
  }

};