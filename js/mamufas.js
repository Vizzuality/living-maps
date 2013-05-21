function Mamufas(el) {
  var self = this;

  this.$el = el;
  this.$body = $("body");
  this.$map_container = $(".map");
  this.$mamufas = $("#mamufas");
  this.$content = $("#content");
  this.$bottom_nav = $("#bottom_nav");
  this.$top_nav = $("#top_nav");

  this.isEnabled = true;

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

  this.initialize();
}

Mamufas.prototype = {

  initialize: function() {
    var self = this;

    // Spinner
    this.target = document.getElementById('spinner-container');
    this.spinner_container = $("#spinner-container");
    this.spinner = new Spinner(this.spin_opts);

    Events.on("enablemamufas", function(from) {
      self.$body.css("overflow-y", "hidden");
      self.$top_nav.removeClass("top");
      self.$top_nav.addClass("mapped");

      $(window).resize(_.debounce(function() {
        self._resizeMap();
      }, 100));

      if(!App.isLoaded) {
        self.spinner.spin(self.target);
      }

      self.$map_container.animate({
        height: $(window).height()
      }, {
        duration: 250,
        queue: false,
        easing: 'linear',
        complete: function() {
          self.$bottom_nav.animate({
            bottom: - $(window).height() - self.$top_nav.height()
          }, {
            duration: 250,
            queue: false,
            easing: 'linear',
            complete: function() {
              self.$top_nav.animate({
                bottom: 0
              }, {
                duration: 250,
                queue: false,
                easing: 'linear'
              });
            }
          });
        }
      });

      if(from === "navigation") {
        self.$content.fadeOut();
        self.$mamufas.fadeIn();
      }

      if(from === "navbar") {
        self._mamufasOff();
      }

      Events.trigger("toggledropdowns", true);
    });

    Events.on("disablemamufas", function(from) {
      $(window).off('resize');

      if(!self.isEnabled) {
        self.$mamufas.hide();
        self._mamufasOn();
      }

      self.spinner.stop();

      self.$body.css("overflow-y", "auto");

      self.$map_container.animate({
        height: "622px"
      }, {
        duration: 250,
        queue: false,
        easing: 'linear',
        complete: function() {
          self.$top_nav.animate({
            bottom: "-92px"
          }, {
            duration: 250,
            queue: false,
            easing: 'linear',
            complete: function() {
              self.$top_nav.removeClass("mapped");
              self.$top_nav.addClass("top");

              self.$bottom_nav.animate({
                bottom: 0
              }, {
                duration: 250,
                queue: false,
                easing: 'linear'
              });
            }
          });
        }
      });

      if(from === "navigation") {
        self.$mamufas.fadeOut();
        self.$content.fadeIn();
      }

      Events.trigger("toggledropdowns", false);
    });

    Events.on("disableanimation", function(city) {
      self.city = city;

      self.spinner_container.removeClass("play").html('');
      self.spinner.spin(self.target);
      self._mamufasOn();
    });

    Events.on("enableanimation", function() {
      $("#play").off("click");
      self._mamufasOff();
    });

    Events.on("stopanimation", function() {
      self.spinner.stop();
      self.spinner_container.addClass("play").html('<a href="#" id="play">Play animation</a>');

      $("#play").on("click", function(e) {
        e.preventDefault();

        self.isEnabled = false;
        Events.trigger("enableanimation");
      });
    });
  },

  _mamufasOn: function() {
    self.isEnabled = true;
    this.$el.fadeIn();

    this._changeTitles(this.city);
  },

  _changeTitles: function(city) {
    //TODO: THIS THREE LINES SHOULD BE OUSTIDE THIS CLASS
    $('#city_name').text([window.AppData.CITIES[city]['city_name']]);
    $('#city_subtitle_small').text([window.AppData.CITIES[city]['city_title']]);

    $("#mamufas_title").text(window.AppData.CITIES[city]['city_title']);
    $("#city_subtitle").text(window.AppData.CITIES[city]['city_subtitle']);
  },

  _airportTitles: function(city) {
    //TODO: THIS THREE LINES SHOULD BE OUSTIDE THIS CLASS
    $('#city_name').airport([window.AppData.CITIES[city]['city_name']]);
    $('#city_subtitle_small').airport([window.AppData.CITIES[city]['city_title']]);
  },

  _resizeMap: function() {
    this.$map_container.animate({
      height: $(window).height()
    });
  },

  _mamufasOff: function() {
    this.$el.fadeOut();
    this._airportTitles(this.city);
  },
}
