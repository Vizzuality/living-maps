

function Carrousel(el) {
  this.el = el;
  this.cities_switch = $("#cities_switch");
  this.cities_nav = $("#cities_nav");
  this.initialize();
}


Carrousel.prototype = {

  initialize: function() {
    this._attachMouse();
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

    if(!$(this.el).hasClass("disabled")) {
      this.cities_switch.on("mouseover", function() {
        self._showCarrousel(true);
      })

      this.el.on("mouseleave", function() {
        self._showCarrousel(false);
      });
    }
  },

  _showCarrousel: function(show) {
    if(show && !$(this.el).hasClass("disabled")) {
      this.el.animate({
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
    } else if(!show && !$(this.el).hasClass("disabled")) {
      this.el.animate({
        "bottom": "-200px"
      }, {
        duration: 100,
        queue: false,
        easing: 'linear'
      });

      this.cities_switch.animate({
        "top": "0"
      }, {
        duration: 100,
        queue: false,
        easing: 'linear'
      });

      this.cities_nav.animate({
        "top": "200px"
      }, {
        duration: 100,
        queue: false,
        easing: 'linear'
      });
    }
  }
};
