function Navigation(el, city) {
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
    // don't override self window object
    that = this;

    $('.dropdown-city-link[data-city="' + this.city + '"]').addClass("selected");

    this.$dropdown_link.on('click', function(e) {
      e.preventDefault();

      that.$dropdown_link.qtip({
        overwrite: false,
        content: {
          text: that.$dropdown_nav
        },
        position: {
          my: that.my,
          at: that.at,
          adjust: {
            y: that.y,
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
              duration: 250
            });
          }
        },
        hide: {
          event: 'click unfocus',
          effect: function() {
            $(this).animate({
              opacity: 0
            }, {
              duration: 250
            });
          }
        },
        style: {
          classes: 'cities_dropdown',
          tip: {
            width: 14,
            height: 6,
            corner: that.my,
            mimic: 'center',
            offset: 10
          }
        }
      });
    });

    $(".city-link").on("click", function(e) {
      var selected_city = $(this).attr("data-city");

      e.preventDefault();

      if(that.city === selected_city) {
        if(App.isPlayed) {
          Events.trigger("enablemamufas");
          Events.trigger("resumeanimation");
        } else {
          Events.trigger("enablemamufas", selected_city);
        }
      } else {
        $(".dropdown-city-link").removeClass("selected");
        $('.dropdown-city-link[data-city="' + selected_city + '"]').addClass("selected");

        that.hideDropdown();

        if(BASE_PATH === "") {
          that.changeMap(selected_city, "/" + this.hash);
        } else {
          that.changeMap(selected_city, "http://" + DOMAIN_URL + "/" + BASE_PATH + "/" + this.hash);
        }
      }
    });

    Events.on("clickedmap", function() {
      that.hideDropdown();
    });

    Events.on("scrolledup", function() {
      that.hideDropdown();
    });

    Events.on("toggledropdowns", function(mamufas) {
      if(mamufas) {
        that.my = 'bottom right';
        that.at = 'top right';
        that.y = 20;
      } else {
        that.my = 'top right';
        that.at = 'bottom right';
        that.y = -20;
      }

      that.initDropdown(that.my, that.at, that.y);
    });
  },

  initDropdown: function(my, at, y) {
    this.$dropdown_link.qtip('option', {
      'position.my' : my,
      'position.at' : at,
      'position.adjust.y' : y,
      'style.tip.corner' : my
    });
  },

  changeMap: function(city, hash) {
    Events.trigger("stopsounds", this.city);

    this.city = city;

    Events.trigger("enablemamufas", this.city);

    if(isDebug)
      hash = hash + "/?debug=true";

    history.pushState(window.AppData.CITIES[city], null, hash);
    App.restart(window.AppData.CITIES[city]);
  },

  hideDropdown: function() {
    $(".cities_dropdown").qtip('hide');
  }
};
