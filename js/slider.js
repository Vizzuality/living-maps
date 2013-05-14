function Slider(el, options) {
  var self = this;

  this.el = el;

  this.options = {
    timeMin: options.timeMin,
    timeRange: options.timeRange,
    map: options.map,
    city: options.city
  };

  /* _.defaults(options, {
   step: 15,
   timeRange: 300
  }); */

  Events.on("animationenabled", function(map, city) {
    self.options.map = map;
    self.options.city = city;

    self.initialize();
  });

  Events.on("animationdisabled", function() {
    // self.disable();
  });
}

var dragged = false;
var clicked = false;
var stopped = true;
var valueStart = 0;

Events.on("clickhandle", function(val) {
  clicked = true;
  valueStart = val;

  $("#selectors").addClass("glow");

  $(document).on("mousemove", function() {
    dragged = true;
  });
});

Events.on("resumeanimation", function() {
  stopped = false;
  $(".ui-slider-handle").removeClass("stopped");
});

Slider.prototype = {
  initialize: function() {
    var self = this;

    this.valueStop = 0;

    // init slider
    this.el.slider();

    this.el
      .on("slide", function(event, ui) {
        self.onSlideStart(ui.value);
      })
      .on("slidestop", function(event, ui) {
        self.onSlideStop(ui.value);
      })
      .find("a")
        .on("mousedown", function() {
          Events.trigger("clickhandle", self.el.slider("value"));
        })
        .on("click", function() {
          if(valueStart === self.valueStop) {
            if(!stopped) {
              Events.trigger("stopanimation");
            } else {
              Events.trigger("resumeanimation");
            }
          }
        })
        .one("mouseenter", function() {
          $("#selectors").addClass("glow");
        })
        .one("mouseleave", function() {
          $("#selectors").removeClass("glow");
        });

    $(document).on("mouseup", function() {
      if(clicked) {
        self.valueStop = self.el.slider("value");

        if(stopped) {
          updateHash(self.options.map, self.options.city, App.time);
        }

        dragged = false;
        clicked = false;

        $(this).off('mousemove');
      }
    });
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

    if (minutes%2 === 0) {
      minutes = (minutes<10?'0':'') + minutes;
      $("#hour").text(hours + ":" + minutes);
    };
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
  },

  disable: function() {
    this.el.off("slide")
      .off("slidestop")
      .find("a")
        .off("mousedown")
        .off("click");
  }
}
