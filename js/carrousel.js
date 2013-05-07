

function Carrousel(el) {
  this.el = el;
  this.cities_switch = $("#cities_switch");
  this.cities_nav = $("#cities_nav");
  this.cities_container = $("#cities_container");
  this.initialize();
}


Carrousel.prototype = {

  initialize: function() {
    this._attachMouse();
  },

  _attachMouse: function() {
    var self = this;

    $(window).on('mousemove', function(e) {
      var width = $(this).width()/2;
      var xPos = e.pageX - width;
      var mouseXPercent = Math.round(xPos / width * 20);

      var diffX = width - self.el.width();
      var myX = diffX * (mouseXPercent / 100);

      self.el.animate({
        'margin-left': myX + 'px'
      }, {
        duration: 50,
        queue: false,
        easing: 'linear'
      });
    });

    this.cities_container.on("mouseover", function() {
      self._showCarrousel(true);
    })
    .on("mouseleave", function() {
      self._showCarrousel(false);
    });
  },

  _showCarrousel: function(show) {
    if(show) {
      this.cities_container.animate({
        "bottom": "-80px"
      }, {
        duration: 100,
        queue: false,
        easing: 'linear'
      });

      this.cities_switch.animate({
        "top": "200px"
      }, {
        duration: 100,
        queue: false,
        easing: 'linear'
      });

      this.cities_nav.animate({
        "top": "0"
      }, {
        duration: 100,
        queue: false,
        easing: 'linear'
      });
    } else {
      this.cities_container.animate({
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
        "top": "80px"
      }, {
        duration: 200,
        queue: false,
        easing: 'linear'
      });
    }
  }
};
