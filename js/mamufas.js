function Mamufas(el) {
  var self = this;

  this.$el = el;
  this.$body = $("body");
  this.$map_container = $("section.map");
  this.$mamufas = $("#mamufas");
  this.$content = $("#content");
  this.$bottom_nav = $("#bottom_nav");
  this.$top_nav = $("#top_nav");
  this.$about = $("#about");
  this.$about_link = $(".about_link");
  this.$contest = $("#contest");
  this.$contest_link = $(".contest_link");
  this.$logo = $("#logo");

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
    this.$spinner_container = $("#spinner-container");
    this.spinner = new Spinner(this.spin_opts);

    // Links
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

    // Mamufas
    Events.on("enablemamufas", function(from) {
      $(window).resize(_.debounce(function() {
        self._resizeMap();
      }, 100));

      self._goTo(event, self.$map_container);

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
            if(App.isPlayed) {
              self._mamufasOff();
            } else {
              self.$content.fadeOut();
              self.$mamufas.fadeIn();

              if(!App.isLoaded) {
                self.spinner.spin(self.target);
              }
            }
          });
        });
      });

      $("body").css("overflow-y", "hidden");

      Events.trigger("toggledropdowns", true);
    });

    Events.on("disablemamufas", function(from) {
      $(window).scroll(_.debounce(function(){
        self._positionScroll();
      }, 100));

      $(window).off('resize');

      if(!self.isEnabled) {
        self.$mamufas.hide();
        self._mamufasOn();
      }

      self.spinner.stop();

      self.$top_nav.animate({
        bottom: "-92px"
      }, 250, function() {
        self.$top_nav.removeClass("mapped");
        self.$top_nav.addClass("top");

        self.$bottom_nav.animate({
          bottom: 0
        }, 250, function() {
          self.$map_container.animate({
            height: "622px"
          }, 250, function() {
            self.$mamufas.fadeOut();
            self.$content.fadeIn();
          });
        });
      });

      $("body").css("overflow-y", "auto");

      Events.trigger("toggledropdowns", false);
    });

    Events.on("disableanimation", function(city) {
      self.city = city;

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
      self.$spinner_container.addClass("play").html('<a href="#" id="play">Play animation</a>');

      $("#play").on("click", function(e) {
        e.preventDefault();

        self.isEnabled = false;
        Events.trigger("enableanimation");
      });
    });
  },

  _goTo: function(e, el) {
    e.preventDefault();

    goTo(el);
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
    self.isEnabled = true;
    this.$el.fadeIn();

    this._changeTitles(this.city);
  },

  _mamufasOff: function() {
    this.$el.fadeOut();
    this._airportTitles(this.city);
  }
}
