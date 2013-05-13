  
  /*
   *  Map zoom control
   */

  var Zoom = {
    el: '#zoom_control',

    options: {
      maxZoom: 15,
      minZoom: 9
    },

    initialize: function(map, city) {
      this.map = map;
      this.city = city;
      this.$el = $(this.el);
      this._initBindings();
    },

    _initBindings: function() {
      this.$el.find('a.zoomIn').on('click', null, this, this._onZoomIn);
      this.$el.find('a.zoomOut').on('click', null, this, this._onZoomOut);
      this.$el.find('a.zoomIn, a.zoomOut').on('hover', this._stopPropagation);
    },

    _onZoomIn: function(e) {
      e.preventDefault();
      var self = e.data;
      if (self.map.getZoom() < self.options.maxZoom) {
        var zoom = self.map.getZoom() + 1;

        updateHash(self.map, self.city, App.time, zoom);
        self.map.zoomIn();
      }
    },

    _onZoomOut: function(e) {
      e.preventDefault();
      var self = e.data;
      if (self.map.getZoom() > self.options.minZoom) {
        var zoom = self.map.getZoom() - 1;

        updateHash(self.map, self.city, App.time, zoom);
        self.map.zoomOut();
      }
    },

    _stopPropagation: function(e) {
      e.preventDefault();
      e.stopPropagation();
    }
  }