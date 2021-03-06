function Slider(el, options) {
  this.el = el;

  this.options = {
    timeMin: options.timeMin,
    timeRange: options.timeRange
  };

  /* _.defaults(options, {
   step: 15,
   timeRange: 300
  }); */

  this.initialize();
}

var dragged = false;
var clicked = false;
var stopped = true;

Events.on("clickhandle", function(val) {
  clicked = true;
  valueStart = val;

  $("#selectors").addClass("glow");

  $(document).mousemove(function() {
    dragged = true;
  });
});

Events.on("stopanimation", function() {
  stopped = true;
  $(".ui-slider-handle").addClass("stopped");
});

Events.on("resumeanimation", function(pos) {
  stopped = false;
  $(".ui-slider-handle").removeClass("stopped");
  $("#slider").slider("value", pos);
});

Slider.prototype = {
  initialize: function() {
    var self = this;

    this.valueStop = 0;

    // init slider
    this.el.slider({
      slide: function(event, ui) {},
      change: function(event, ui) {},
      stop: function(event, ui) {}
    });

    this.el
      .on("slide", function(event, ui) {
        self.onSlideStart(ui.value);
      })
      .on("slidestop", function(event, ui) {
        self.onSlideStop(ui.value);
      })
      .find("a")
        .on("mouseenter", function() {
          $("#selectors").addClass("glow");
        })
        .on("mouseleave", function() {
          $("#selectors").removeClass("glow");
        })
        .on("mousedown", function() {
          Events.trigger("clickhandle", self.el.slider("value"));
        })
        .on("click", function() {
          if(!dragged && valueStart === self.valueStop) {
            if(!stopped) {
              Events.trigger("stopanimation");
            } else {
              Events.trigger("resumeanimation");
            }
          }
        });

    $(document).on("mouseup", function() {
      dragged = false;
      self.valueStop = self.el.slider("value");

      $(this).unbind('mousemove');

      clicked = false;
    })
  },

  onSlideStart: function(pos) {
    var time = this.posToTime(pos);

    this.onTimeChange && this.onTimeChange(time);

    this.updateHour(time);
    this.updateSky(pos);
  },

  onSlideStop: function(pos) {
    var time = this.posToTime(pos);

    this.el.slider("value", pos);

    this.onTimeChange && this.onTimeChange(time);

    this.updateHour(time);
    this.updateSky(pos);
  },

  updateHour: function(time) {
    var timeUpdated = new Date(this.options.timeMin + 1000 * time);
    var hours = timeUpdated.getHours();
    var minutes = timeUpdated.getMinutes();

    minutes = (minutes<10?'0':'') + minutes;

    $("#hour").text(hours + ":" + minutes);
  },

  updateSky: function(pos) {
    var r = 62;
    var posS = (pos+20)/Math.PI/5;
    var posM = (pos+70)/Math.PI/5;

    $("#sun").css({
      "left": 62 + (r * Math.cos(posS)) + "px",
      "top": 125 + (r * Math.sin(posS)) + "px"
    });

    $("#moon").css({
      "left": 62 + (r * Math.cos(posM)) + "px",
      "top": 125 + (r * Math.sin(posM)) + "px"
    });

    // darker n * 1/pos, lighter 255 - (100-pos)
    // $("#wrapper").css({
    //   "background": "-webkit-linear-gradient(top, rgba(0, 187, 221, 0.4), rgba(53, 96, 149, 0.4) 100%)"
    // });
  },

  posToTime: function(pos) {
    return pos * 60 * this.options.timeRange / 100;
  },

  timeToPos: function(time) {
    return 100 * time / (60 * this.options.timeRange);
  },

  render: function() { // empty on purpose
    
  },

  set_time: function(time) {
    this.el.slider("value", this.timeToPos(time));

    this.updateHour(time);
    this.updateSky(this.timeToPos(time));
  }
}
