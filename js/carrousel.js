function Carrousel(el, city) {
  var self = this;

  this.$el = el;
  this.$dropdown_link = $('#dropdown_link');
  this.$dropdown_nav = $('#dropdown_nav');

  this.city = city;

  this.initialize(city);
}


Carrousel.prototype = {

  initialize: function(city) {
    self = this;

    $('a[data-city="' + this.city + '"]').addClass("selected");

    // dropdowns
    this.$dropdown_link.on('click', function(e) {
      e.preventDefault();

      self.$dropdown_link.qtip({
        overwrite: false,
        content: {
          text: self.$dropdown_nav
        },
        position: {
          my: 'bottom right',
          at: 'top right',
          adjust: {
            y: 20,
            x: -2
          }
        },
        show: {
          event: e.type,
          ready: true,
          effect: function() {
            $(this).show().css('opacity', '0').animate({ opacity: 1 }, { duration: 100 });
          }
        },
        hide: {
          event: 'unfocus click',
          effect: function() {
            $(this).animate({ opacity: 0, "top": "-=10px" }, { duration: 100 });
          }
        },
        style: {
          classes: 'cities_dropdown',
          tip: { width: 14, height: 6, corner: 'bottom right',  mimic: 'center', offset: 10 }
        }
      });
    });

    $(".city-link").on("click", function(e) {
      var selected_city = $(this).attr("data-city");

      e.preventDefault();

      if(selected_city != self.city && !$(this).hasClass("disabled")) {
        $(".city-link").removeClass("selected");
        $(this).addClass("selected")

        $("#qtip-0").qtip().hide();

        self.changeMap($(this).attr("data-city"), this.href);
      }
    });
  },

  changeMap: function(city, hash) {
    this.city = city;

    history.pushState(window.AppData.CITIES[city], null, hash);
    App.restart(window.AppData.CITIES[city]);
  }
};
