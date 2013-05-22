function Navigation(el, city) {
  var self = this;

  this.$el = el;
  this.$dropdown_link = $('#dropdown_link');
  this.$dropdown_nav = $('#dropdown_nav');
  this.isEnabled = false;
  this.my = 'top right';
  this.at = 'bottom right';
  this.y = -20;

  this.city = city;

  this.initialize();
}


Navigation.prototype = {

  initialize: function() {
    self = this;

    $('.dropdown-city-link[data-city="' + this.city + '"]').addClass("selected");

    this.$dropdown_link.on('click', function(e) {
      e.preventDefault();

      self.$dropdown_link.qtip({
        overwrite: false,
        content: {
          text: self.$dropdown_nav
        },
        position: {
          my: self.my,
          at: self.at,
          adjust: {
            y: self.y,
            x: -2
          }
        },
        show: {
          event: e.type,
          ready: true,
          effect: function() {
            $(this).show().css('opacity', '0').animate({
              opacity: 1
            }, {
              duration: 100
            });
          }
        },
        hide: {
          event: 'click unfocus',
          effect: function() {
            $(this).animate({
              opacity: 0,
              "top": "-=10px"
            }, {
              duration: 100
            });
          }
        },
        style: {
          classes: 'cities_dropdown',
          tip: {
            width: 14,
            height: 6,
            corner: self.my,
            mimic: 'center',
            offset: 10
          }
        }
      });
    });

    $(".city-link").on("click", function(e) {
      var selected_city = $(this).attr("data-city");

      e.preventDefault();

      if(self.city === selected_city) {
        if(App.isPlayed) {
          Events.trigger("enablemamufas");
          Events.trigger("resumeanimation");
        } else {
          Events.trigger("enablemamufas", selected_city);
        }
      } else {
        $(".dropdown-city-link").removeClass("selected");
        $('.dropdown-city-link[data-city="' + selected_city + '"]').addClass("selected");

        self.hideDropdown();

        self.changeMap(selected_city, this.href);
      }
    });

    Events.on("scrolledup", function() {
      self.hideDropdown();
    });

    Events.on("toggledropdowns", function(mamufas) {
      if(mamufas) {
        self.my = 'bottom right';
        self.at = 'top right';
        self.y = 20;
      } else {
        self.my = 'top right';
        self.at = 'bottom right';
        self.y = -20;
      }

      self.initDropdown(self.my, self.at, self.y);
    });
  },

  initDropdown: function(my, at, y) {
    var self = this;

    self.$dropdown_link.qtip('option', {
      'position.my' : my,
      'position.at' : at,
      'position.adjust.y' : y,
      'style.tip.corner' : my
    });
  },

  changeMap: function(city, hash) {
    this.city = city;

    Events.trigger("enablemamufas", this.city);

    history.pushState(window.AppData.CITIES[city], null, hash);
    App.restart(window.AppData.CITIES[city]);
  },

  hideDropdown: function() {
    $(".cities_dropdown").qtip('hide');
  }
};
