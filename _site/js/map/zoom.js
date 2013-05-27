/*
 *  Map zoom control
 */

var Zoom = {
  el: '#zoom_control',

  initialize: function(map, city) {
    this.map = map;
    this.city = city;
    this.$el = $(this.el);
    this.$zoomIn = $(".zoomIn");
    this.$zoomOut = $(".zoomOut");
    this._initBindings();
  },

  _initBindings: function() {
    this.map.doubleClickZoom.disable();
    this._checkMaxMin(this.map.getZoom());
    this.$el.find('a.zoomIn').on('click', null, this, this._onZoomIn);
    this.$el.find('a.zoomOut').on('click', null, this, this._onZoomOut);
    this.$el.find('a.zoomIn, a.zoomOut').on('hover', this._stopPropagation);
    Events.on("dblclickedmap", this._onDblClickZoomIn, this);
    Events.on("poiclick", this._onPoiClick, this);
  },

  _onDblClickZoomIn: function(e) {
    e.preventDefault();
    var self = this;
    var max_zoom = window.AppData.CITIES[self.city].map.maxZoom;

    if(self.map.getZoom() < max_zoom) {
      var zoom = self.map.getZoom() + 1;

      if(!stopped) {
        updateHash(self.map, self.city, window.AppData.init_time, zoom);
      } else {
        updateHash(self.map, self.city, App.time, zoom);
      }

      self._checkMaxMin(zoom);
      self.map.zoomIn();
    }
  },

  _onPoiClick: function(poi, zoom) {
    var self = this;
    var max_zoom = window.AppData.CITIES[self.city].map.maxZoom;

    if(self.map.getZoom() < max_zoom) {
      var zoom = self.map.getZoom() + 1;

      if(!stopped) {
        updateHash(self.map, self.city, window.AppData.init_time, zoom);
      } else {
        updateHash(self.map, self.city, App.time, zoom);
      }

      self._checkMaxMin(zoom);
      self.map.zoomIn();
    } else {
      self.map.setView([poi.lat, poi.lon], zoom);
    }
  },

  _onZoomIn: function(e) {
    e.preventDefault();
    var self = e.data;
    var max_zoom = window.AppData.CITIES[self.city].map.maxZoom;

    if(self.map.getZoom() < max_zoom) {
      var zoom = self.map.getZoom() + 1;

      if(!stopped) {
        updateHash(self.map, self.city, window.AppData.init_time, zoom);
      } else {
        updateHash(self.map, self.city, App.time, zoom);
      }

      self._checkMaxMin(zoom);
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

      self._checkMaxMin(zoom);
      self.map.zoomOut();
    }
  },

  _checkMaxMin: function(zoom) {
    if(zoom > window.AppData.CITIES[this.city].map.minZoom) {
      this._enableZoomOut();
    } else if(zoom === window.AppData.CITIES[this.city].map.minZoom) {
      this._disableZoomOut();
    }

    if(zoom < window.AppData.CITIES[this.city].map.maxZoom) {
      this._enableZoomIn();
    } else if(zoom === window.AppData.CITIES[this.city].map.maxZoom) {
      this._disableZoomIn();
    }
  },

  _enableZoomIn: function() {
    this.$zoomIn.removeClass("disabled");
  },

  _disableZoomIn: function() {
    this.$zoomIn.addClass("disabled");
  },

  _enableZoomOut: function() {
    this.$zoomOut.removeClass("disabled");
  },

  _disableZoomOut: function() {
    this.$zoomOut.addClass("disabled");
  },

  _stopPropagation: function(e) {
    e.preventDefault();
    e.stopPropagation();
  },

  set_city: function(city) {
    this.city = city;
    this._checkMaxMin(this.map.getZoom());
  }
}
