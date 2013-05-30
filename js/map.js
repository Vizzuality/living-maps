
/**
 * manages map creation, interations and layers
 */

function Map(el, options) {
  this.el = el;
  this.options = options;
  this.isDragging = false;

  this.initialize();
}

Map.prototype = {

  templates: {
    gradients: '<div class="edge top"></div><div class="edge right"></div><div class="edge left"></div>'
  },

  // creates the map and add it to the DOM
  initialize: function() {
    var self = this;

    this.options.fadeAnimation = false;
    this.options.trackResize = true;
    this.map = L.map(this.el, this.options)
      .setView(this.options.center, this.options.zoom);

    // Add layers
    this._addLayers();

    // Set bindings
    this._addBindings();
  },

  _addLayers: function() {
    var self = this;

    self.probsLayer = new StreetLayer({
      table: this.options.city +"_manydays_live",
      time_offset: this.options.time_offset,
      reduction: this.options.reduction
    });

    self.map.addLayer(self.probsLayer);

    // Add gradients layer
    this.set_gradients();
  },

  _addBindings: function() {
    var self = this;

    this.map
      .on('mousedown', function() {
        Events.trigger("clickedmap");
      })
      .on('dragstart', function(e) {
        this.isDragging = true;
      })
      .on('dragend', function(e) {
        this.isDragging = false;

        if(!stopped) {
          updateHash(this, self.options.city, 0);
        } else {
          updateHash(this, self.options.city, App.time);
        }
      })
      .on('dblclick', function(e) {
        console.log(e);
        Events.trigger("dblclickedmap", e.originalEvent);
      })
      .on('scrollWheelZoom', function(e) {
        console.log(e);
      })
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

  set_city: function(center, zoom, city, time_offset, reduction) {
    this.options.city = city;
    this.options.time_offset = time_offset;

    if(this.probsLayer) {
      this.probsLayer.setCity(city, time_offset, reduction);
    }

    // ****
    // THIS SHOULD BE ___AFTER___ probsLayer.setCity
    // ****

    this.map.setView(center, zoom);
  },

  render: function() {
    if(this.probsLayer) {
      this.probsLayer._render();
    }
  }
};
