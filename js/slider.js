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
var valueStart = 0;

Events.on("clickhandle", function(val) {
  App.clicked = true;
  valueStart = val;

  $("#selectors").addClass("glow");
  $(document).mousemove(function() {
    dragged = true;
  });
});

Events.on("stopanimation", function() {
  App.stopped = true;
  $(".ui-slider-handle").addClass("stopped");
});

Events.on("resumeanimation", function(pos) {
  App.stopped = false;
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
            if(!App.stopped) {
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

    $("#sun").css({
      "left": 62 + (r * Math.cos((pos+160)/19.5)) + "px",
      "top": 125 + (r * Math.sin((pos+160)/19.5)) + "px"
    });

    $("#moon").css({
      "left": 62 + (r * Math.cos((pos+100)/19.5)) + "px",
      "top": 125 + (r * Math.sin((pos+100)/19.5)) + "px"
    });
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
