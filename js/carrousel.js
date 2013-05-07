

function Carrousel(el) {
  this.el = el;
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
  }


};
