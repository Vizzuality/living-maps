  
  /*
   *  Map zoom control
   */

  var Zoom = {
    el: '#zoom_control',

    options: {
      maxZoom: 15,
      minZoom: 9
    },

    initialize: function(map) {
      this.map = map;
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
        self.map.zoomIn();
      }
    },

    _onZoomOut: function(e) {
      e.preventDefault();
      var self = e.data;
      if (self.map.getZoom() > self.options.minZoom) {
        self.map.zoomOut();
      }
    },

    _stopPropagation: function(e) {
      e.preventDefault();
      e.stopPropagation();
    }
  }