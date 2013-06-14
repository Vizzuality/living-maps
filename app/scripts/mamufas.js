function Mamufas(el, map, city) {
  var self = this;

  this.$el = el;
  this.$map_container = $("section.map");
  this.$map = $("#map");
  this.$mamufas = $("#mamufas");
  this.$content = $("#content");
  this.$components = $(".components");
  this.$bottom_nav = $("#bottom_nav");
  this.$top_nav = $("#top_nav");
  this.$about = $("#about");
  this.$about_link = $(".about_link");
  this.$contest = $("#contest");
  this.$contest_link = $(".contest_link");
  this.$logo = $("#logo");
  this.$layers = $("#layers");

  this.isEnabled = false;

  this.spin_opts = {
    lines: 8, // The number of lines to draw
    length: 0, // The length of each line
    width: 6, // The line thickness
    radius: 9, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: 'white', // #rgb or #rrggbb
    speed: 0.9, // Rounds per second
    trail: 53, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: 15, // Top position relative to parent in px
    left: 15 // Left position relative to parent in px
  };

  this.city = city;
  this.map = map;

  this.initialize();
}

Mamufas.prototype = {

  initialize: function() {
    var self = this;

    // Spinner
    this.target = document.getElementById('spinner-container');
    this.$spinner_container = $("#spinner-container");
    this.spinner = new Spinner(this.spin_opts);

    // Links
    $(window).scroll(_.debounce(function(){
      self._positionScroll();
    }, 100));

    this.$about_link.on("click", function(event) {
      Events.trigger("disablemamufas");

      self._goTo(event, self.$about);
    });

    this.$contest_link.on("click", function(event) {
      Events.trigger("disablemamufas");

      self._goTo(event, self.$contest);
    });

    this.$logo.on("click", function(event) {
      self._goTo(event, self.$map_container);

      Events.trigger("disablemamufas");
    });

    this.$layers.find(".feature")
      .on("mouseenter", function() {
        var layer = $(this).attr("data-rel");

        for (var i = 0; i < $(".layer").length; i++) {
          if($(".layer")[i].id != layer) {
            $($(".layer")[i]).animate({
              opacity: ".2"
            }, {
              duration: 200,
              queue: false
            });
          }
        }
      }).on("mouseleave", function() {
        $(".layer").animate({
          opacity: 1
        }, {
          duration: 200,
          queue: false
        });
      });

    // Mamufas
    Events.on("enablemamufas", function(city) {
      if(self.isEnabled) {
        if(self.city != city) {
          self._changeMamufasTitles(city);
          self._changeCityTitles(city);

          self.city = city;
        }
      } else {
        self.isEnabled = true;

        goTo(self.$map_container);

        self.$top_nav.removeClass("top");
        self.$top_nav.addClass("mapped");

        self.$map_container.animate({
          height: $(window).height()
        }, 250, function() {
          self.$bottom_nav.animate({
            bottom: "-92px"
          }, 250, function() {
            self.$top_nav.animate({
              bottom: 0
            }, 250, function() {
              self.map.invalidateSize();

              if(!App.isLoaded) {
                self.spinner.spin(self.target);
              }

              if(App.isPlayed) {
                self._mamufasOff();
                self.$components.fadeIn();
              } else {
                self.$content.fadeOut();
                self._changeMamufasTitles(self.city);
                self.$mamufas.fadeIn();
                self.$components.fadeIn();
                self._changeCityTitles(self.city);
              }
            });
          });
        });

        $(window).resize(_.debounce(function() {
          self._resizeMap();
        }, 100));

        $("body").css("overflow-y", "hidden");

        Events.trigger("toggledropdowns", true);
      }

      // history.pushState(window.AppData.CITIES[self.city], null, "/#cities/" + self.city);
    });

    Events.on("disablemamufas", function() {
      self.isEnabled = false;

      $(window).off('resize');
      $(document).off("keyup");

      self.$top_nav.animate({
        bottom: "-92px"
      }, 250, function() {
        self.$top_nav.removeClass("mapped");
        self.$top_nav.addClass("top");

        self.$bottom_nav.animate({
          bottom: 0
        }, 250, function() {
          self.$map_container.animate({
            height: "642px"
          }, 250, function() {
            if(!App.isLoaded) {
              self.spinner.stop();
            }

            self.$components.fadeOut();
            self.$mamufas.fadeOut();

            if(App.isPlayed) {
              self.$content.show();
              self._mamufasOn();
            } else {
              self.$content.fadeIn();
            }
          });
        });
      });

      $("body").css("overflow-y", "auto");

      Events.trigger("toggledropdowns", false);

      history.pushState(window.AppData.CITIES[self.city], null, "/");
    });

    Events.on("disableanimation", function(map, city) {
      self.city = city;
      self.map = map;

      self.$spinner_container.removeClass("play").html('');
      self.spinner.spin(self.target);

      self._mamufasOn();
    });

    Events.on("enableanimation", function() {
      $("#play").off("click");

      self._mamufasOff();
    });

    Events.on("stopanimation", function() {
      self.spinner.stop();
      self.$spinner_container.addClass("play").html('<a href="#" id="play">Explore The Living City</a>');

      $("#play").on("click", function(e) {
        e.preventDefault();

        Events.trigger("enableanimation");
      });
    });
  },

  _goTo: function(e, el) {
    e.preventDefault();

    goTo(el);
  },

  _changeMamufasTitles: function(city) {
    //TODO: THIS THREE LINES SHOULD BE OUSTIDE THIS CLASS
    $("#mamufas_title").text(window.AppData.CITIES[city]['city_title']);
    $("#city_subtitle").text(window.AppData.CITIES[city]['city_subtitle']);
  },

  _changeCityTitles: function(city) {
    //TODO: THIS THREE LINES SHOULD BE OUSTIDE THIS CLASS
    $('#city_name').airport([window.AppData.CITIES[city]['city_name']]);
    $('#city_subtitle_small').airport([window.AppData.CITIES[city]['city_title']]);

    setTimeout(function() {
      $('#hour').airport([$('#hour').text()]);
    }, 100);
  },

  _resizeMap: function() {
    var self = this;

    this.$map_container.animate({
      height: $(window).height()
    }, function() {
      self.map.invalidateSize();
    });
  },

  _positionScroll: function() {
    var self = this;

    if($(window).scrollTop() >= this.$map_container.height()) {
      this.$top_nav.animate({top: "0"}, 100);
    } else {
      this.$top_nav.animate({top: "-92px"}, 100, function() {
        Events.trigger("scrolledup");
      });
    }
  },

  _mamufasOn: function() {
    this.$el.fadeIn();
  },

  _mamufasOff: function() {
    this.$el.fadeOut();
  }
}
