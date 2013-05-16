
function Mamufas(el, city) {
  var self = this;

  this.el = el;

  this.city = city;
  this.play = this.el.find("#play");

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

  initialize: function(city) {
    this.city = city;
    this._initBindings(city);
  },

  _initBindings: function(city) {
    var self = this;

    Events.on("animationdisabled", function(city) {
      self.city = city;
      self._mamufasOn();
    });

    Events.on("stopanimation", function() {
      self.spinner.stop();
      self.spinner_container.addClass("play").html('<a href="#" id="play">Play animation</a>');
    });

    this.play.on("click", function(e) {
      e.preventDefault();

      Events.trigger("resumeanimation");
    });
  },

  _mamufasOn: function() {
    // Spinner
    this.target = document.getElementById('spinner-container');
    this.spinner_container = $("#spinner-container");
    this.spinner = new Spinner(this.spin_opts);

    this.spinner.spin(this.target);
    this._changeTitles(this.city);
  },

  _changeTitles: function(city) {
    $("#city_name").text(window.AppData.CITIES[city]['city_name']);
    $("#city_title").text(window.AppData.CITIES[city]['city_title']);
    $("#city_subtitle").text(window.AppData.CITIES[city]['city_subtitle']);
  },

  _mamufasOff: function() {
    this.el.fadeOut();
  }
}
