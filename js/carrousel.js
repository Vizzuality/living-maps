

function Carrousel(el, city) {
  var self = this;

  this.el = el;
  this.cities_nav = $("#cities_nav");

  Events.on("animationenabled", function() {
    self.initialize(city);
  });

  Events.on("animationdisabled", function() {
    self.disable();
  });
}


Carrousel.prototype = {

  initialize: function(city) {
    self = this;

    $('a[data-map="' + city + '"]').addClass("selected");

    this.cities_nav.find("a").on("click", function(e) {
      var slected_map = $(this).attr("data-map");

      e.preventDefault();

      if(slected_map != city) {
        self.changeMap($(this).attr("data-map"), this.href);

        $(".city-link").removeClass("selected");
      }
    });
  },

  _detachMouse: function() {
  },

  changeMap: function(city, hash) {
    history.pushState(window.AppData.CITIES[city], null, hash);
    App.restart(window.AppData.CITIES[city]);
  },

  disable: function() {
    this._detachMouse();

    this.cities_nav.find("a").off("click");
  }
};
