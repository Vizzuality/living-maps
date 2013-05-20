
function Mamufas(el, city) {
  var self = this;

  this.$el = el;
  this.$content = $("#content");
  this.$body = $("body");
  this.$map_container = $(".map");
  this.$bottom_nav = $("#bottom_nav");
  this.$top_nav = $("#top_nav");

  this.city = city;
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
    top: 'auto', // Top position relative to parent in px
    left: 'auto' // Left position relative to parent in px
  };

  this.initialize(city);
}

Mamufas.prototype = {

  initialize: function() {
    this.city = city;
    this._initBindings();
  },

  _initBindings: function() {
    var self = this;

    // Spinner
    this.target = document.getElementById('spinner-container');
    this.spinner_container = $("#spinner-container");
    this.spinner = new Spinner(this.spin_opts);

    Events.on("disableanimation", function(city) {
      self.city = city;

      self.spinner_container.removeClass("play").html('');

      self._mamufasOn();
    });

    Events.on("stopanimation", function() {
      self.spinner.stop();
      self.spinner_container.addClass("play").html('<a href="#" id="play">Play animation</a>');

      $("#play").on("click", function(e) {
        e.preventDefault();

        Events.trigger("enableanimation");
      });
    });

    Events.on("enableanimation", function() {
      Events.off('finish_loading');
      $("#play").off("click");
      self._mamufasOff();

      Events.trigger("resumeanimation");
    });

    Events.on("enablemamufas", function() {
      if(!self.isEnabled) {
        self.isEnabled = true;

        self.$body.css("overflow-y", "hidden");

        var h = $(window).height() + self.$bottom_nav.outerHeight();

        self.$map_container.animate({
          height: h
        }, {
          duration: 250,
          queue: false,
          easing: 'linear',
          complete: function() {
            self.$top_nav.removeClass("top");
            self.$top_nav.addClass("mapped");

            self.$top_nav.animate({
              bottom: 0
            }, {
              duration: 250,
              queue: false,
              easing: 'linear'
            });

            self.$content.fadeOut();
            self.$el.fadeIn();
          }          
        });

        Events.trigger("toggledropdowns", true);
      }
    });

    Events.on("disablemamufas", function() {
      if(self.isEnabled) {
        self.isEnabled = false;

        self.$el.fadeOut();
        self.$content.fadeIn();

        self.$body.css("overflow-y", "auto");

        self.$top_nav.animate({
          bottom: "-72px"
        }, {
          duration: 250,
          queue: false,
          easing: 'linear',
          complete: function() {
            self.$top_nav.removeClass("mapped");
            self.$top_nav.addClass("top");

            self.$map_container.animate({
              height: "560px"
            }, {
              duration: 250,
              queue: false,
              easing: 'linear'
            });
          }
        });

        Events.trigger("toggledropdowns", false);
      }
    });
  },

  _mamufasOn: function() {
    this.$el.fadeIn();

    this.spinner.spin(this.target);
    this._changeTitles(this.city);
  },

  _changeTitles: function(city) {
    
    //TODO: THIS THREE LINES SHOULD BE OUSTIDE THIS CLASS
    $('#city_name').airport([window.AppData.CITIES[city]['city_name']]);
    $('#city_subtitle_small').airport([window.AppData.CITIES[city]['city_title']]);

    $("#mamufas_title").text(window.AppData.CITIES[city]['city_title']);
    $("#city_subtitle").text(window.AppData.CITIES[city]['city_subtitle']);
  },

  _mamufasOff: function() {
    var self = this;

    this.$el.fadeOut();
  },

}
