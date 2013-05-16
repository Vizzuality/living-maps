

function Carrousel(el, city) {
  var self = this;

  this.el = el;
  this.dropdown_link = $('#dropdown_link');
  this.dropdown_nav = $('#dropdown_nav');
  this.map = map;

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

    // dropdowns
    this.dropdown_link.on('click', function(e) {
      e.preventDefault();

      self.dropdown_link.qtip({
        overwrite: false,
        content: {
          text: self.dropdown_nav
        },
        position: {
          my: 'bottom right',
          at: 'top right',
          adjust: {
            y: -10,
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
          classes: 'tooltip_dropdown',
          tip: { width: 14, height: 6, corner: 'bottom right',  mimic: 'center', offset: 10 }
        }
      });
    });

    $('a[data-map="' + city + '"]').addClass("selected");

    $(".city-link").on("click", function(e) {
      var slected_map = $(this).attr("data-map");

      e.preventDefault();

      if($(this).hasClass("disabled")) {
        return false;
      }

      $("#qtip-0").qtip().hide();;

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
    this.el.find("a").off("click");
  }
};
