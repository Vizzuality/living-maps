  
  /*
   *  Map zoom control
   */

  var Zoom = {
    el: '#zoom_control',

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
      var max_zoom = window.AppData.CITIES[self.city].map.maxZoom;
      if (self.map.getZoom() < max_zoom) {
        var zoom = self.map.getZoom() + 1;
        if(!stopped) {
          updateHash(self.map, self.city, window.AppData.init_time, zoom);
        } else {
          updateHash(self.map, self.city, App.time, zoom);
        }
        self.map.zoomIn();
      }
    },

    _onZoomOut: function(e) {
      e.preventDefault();
      var self = e.data;
      var min_zoom = window.AppData.CITIES[self.city].map.minZoom;
      if (self.map.getZoom() > min_zoom) {
        var zoom = self.map.getZoom() - 1;
        if(!stopped) {
          updateHash(self.map, self.city, window.AppData.init_time, zoom);
        } else {
          updateHash(self.map, self.city, App.time, zoom);
        }
        self.map.zoomOut();
      }
    },

    _stopPropagation: function(e) {
      e.preventDefault();
      e.stopPropagation();
    },

    set_city: function(city) {
      this.city = city;
    }
  }