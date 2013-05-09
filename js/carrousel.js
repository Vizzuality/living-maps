

function Carrousel(el, map) {
  var self = this;

  this.el = el;
  this.map = map;
  this.cities_switch = $("#cities_switch");
  this.cities_nav = $("#cities_nav");

  Events.on("animationenabled", function() {
    self.initialize();
  });
}


Carrousel.prototype = {

  initialize: function() {
    self = this;

    this._attachMouse();

    this.cities_nav.find("a").on("click", function(e) {
      e.preventDefault();

      self._showCarrousel(false);
      self.changeMap($(this).attr("data-map"));
    });
  },

  _attachMouse: function() {
    var self = this;

    $(this.el).on('mousemove', function(e) {
      var width = $(this).width()/2;
      var xPos = e.pageX - width;
      var mouseXPercent = Math.round(xPos / width * 20);

      var diffX = width - self.el.width();
      var myX = diffX * (mouseXPercent / 100);

      self.cities_nav.animate({
        'margin-left': myX + 'px'
      }, {
        duration: 50,
        queue: false,
        easing: 'linear'
      });
    })
    .on("mouseleave", function() {
      self.cities_nav.animate({
        "margin-left": "0"
      }, {
        duration: 50,
        queue: false,
        easing: 'linear'
      });
    });

    this.cities_switch.on("mouseover", function() {
      if(!self.map.map.isDragging) {
        self._showCarrousel(true);
      }
    });

    this.el.on("mouseleave", function() {
      if(!self.map.map.isDragging) {
        self._showCarrousel(false);
      }
    });
  },

  _detachMouse: function() {
    var self = this;

    $(this.el).off('mousemove').off("mouseleave");

    this.cities_switch.off("mouseover");
  },

  _showCarrousel: function(show) {
    if(show && !$(this.el).hasClass("disabled")) {
      this.el.animate({
        "bottom": "-80px"
      }, {
        duration: 200,
        queue: false,
        easing: 'linear'
      });

      this.cities_switch.animate({
        "top": "200px"
      }, {
        duration: 200,
        queue: false,
        easing: 'linear'
      });

      this.cities_nav.animate({
        "top": "0"
      }, {
        duration: 200,
        queue: false,
        easing: 'linear'
      });
    } else if(!show && !$(this.el).hasClass("disabled")) {
      this.el.animate({
        "bottom": "-200px"
      }, {
        duration: 200,
        queue: false,
        easing: 'linear'
      });

      this.cities_switch.animate({
        "top": "0"
      }, {
        duration: 200,
        queue: false,
        easing: 'linear'
      });

      this.cities_nav.animate({
        "top": "200px"
      }, {
        duration: 200,
        queue: false,
        easing: 'linear'
      });
    }
  },

  changeMap: function(city) {
    self = this;

    App.restart({
      map: this.getMapInfo(city),
      time_scale: 15 * 60,
      scale: 2.0,
      city: city
    });
  },

  getMapInfo: function(city) {
    var mapInfo = {};

    if(city === 'chicago') {
      mapInfo = {
        name: "here_osm_madrid",
        zoom: 10,
        center: [51.511214, -0.100824]
      }
    } else if(city === 'london') {
      mapInfo = {
        name: "here_osm_madrid",
        zoom: 12,
        center: [51.511214, -0.100824]
      }
    }

    return mapInfo;
  },

  disable: function() {
    this._detachMouse();

    this.cities_nav.find("a").off("click");
  }
};
