

function Carrousel(el, map) {
  var self = this;

  this.el = el;
  this.map = map;
  this.cities_switch = $("#cities_switch");
  this.cities_nav = $("#cities_nav");

  Events.on("animationenabled", function() {
    self.initialize();
  });

  Events.on("animationdisabled", function() {
    self.disable();
  });
}


Carrousel.prototype = {

  initialize: function() {
    self = this;

    var zoom_w = $("#zoom_control").width() + 50;

    this.el.css({
      "width": $(window).width()-(zoom_w*2),
      "margin-left": zoom_w
    });

    this._attachMouse();

    this.cities_nav.find("a").on("click", function(e) {
      self._showCarrousel(false);
      self.changeMap($(this).attr("data-map"));

      $(".city-link").removeClass("selected");
      $(this).addClass("selected");

      history.pushState(null, null, this.href);

      e.preventDefault();
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
      if(!self.map.map.isDragging || sharing) {
        self._showCarrousel(true);
      }
    });

    this.el.on("mouseleave", function() {
      if(!self.map.map.isDragging || sharing) {
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
    App.restart(window.AppData.CITIES[city]);
  },

  disable: function() {
    this._detachMouse();

    this.cities_nav.find("a").off("click");
  }
};
