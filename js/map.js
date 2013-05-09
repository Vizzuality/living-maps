
/**
 * manages map creation, interations and layers
 */

function Map(el, options) {
  this.el = el;
  this.options = options;
  this.initialize();
}

Map.prototype = {

  templates: {
    gradients: '<div class="edge top"></div><div class="edge right"></div><div class="edge left"></div>'
  },

  // creates the map and add it to the DOM
  initialize: function() {
    this.options.fadeAnimation = false;
    this.map = L.map(this.el, this.options)
      .setView(this.options.center, this.options.zoom);

    this._addLayers();
    this._addBindings();
  },

  _addLayers: function() {
    var self = this;
    // base layer
    /*cartodb.createLayer(this.map, 
      'http://pulsemaps.cartodb.com/api/v1/viz/rds_s/viz.json', {
        interaction: false
      }
    ).done(function(layer) {
      self.map.addLayer(layer)
      //self.probsLayer = new StreetLayer();
      //self.map.addLayer(self.probsLayer);
    });*/

    self.probsLayer = new StreetLayer();
    self.map.addLayer(self.probsLayer);

    // Add gradients layer
    this.set_gradients();
  },

  _addBindings: function() {
    this.map
      .on('dragstart', function(e) {
        this.isDragging = true;
      })
      .on('dragend', function(e) {
        this.isDragging = false;
      });
  },

  set_gradients: function() {
    $(this.map.getPanes().canvasPane)
      .append(this.templates.gradients);
  },

  set_time: function(t) {
    if(this.probsLayer) {
      this.probsLayer.set_time(t);
    }
  },

  set_city: function(center, zoom, city) {
    console.log(center, zoom, city);
  },

  render: function() {
    if(this.probsLayer) {
      this.probsLayer._render();
    }
  }

};
