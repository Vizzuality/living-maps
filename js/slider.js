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

Slider.prototype = {
  initialize: function() {
    var self = this;

    this.clicked = false;
    this.dragged = false;
    this.valueStart = 0;
    this.valueStop = 0;
    this.stopped = false;

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
          self.clicked = true;
          self.valueStart = self.el.slider("value");

          $("#selectors").addClass("glow");
          $(document).mousemove(function() {
            self.dragged = true;
          });
        })
        .on("click", function() {
          if(!self.dragged && self.valueStart === self.valueStop) {
            if(!self.stopped) {
              self.stopped = true;
            } else {
              self.stopped = false;
            }
          }
        });

    $(document).on("mouseup", function() {
      self.dragged = false;
      self.valueStop = self.el.slider("value");

      $(this).unbind('mousemove');

      self.clicked = false;
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
    var w = 200;

    $("#sun").css({
      "left": -35 + (pos*w/100) + "px",
      "top": 100 + ((+0.160000 * Math.pow(pos,2))-(16 * pos) + 300) + "px"
    });

    $("#moon").css({
      "left": 35 + (pos*w/100) + "px",
      "top": 100 + ((Math.cos(pos/18) * 4) * w / 20) * -1 + "px"
    });

    $("#moon2").css({
      "left": -150 + (pos*w/100) + "px",
      "top": 100 + ((Math.cos(pos/18) * 4) * w / 20) * -1 + "px"
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
    if(!this.stopped && !this.clicked){
      this.el.slider("value", this.timeToPos(time));
    
      this.updateHour(time);
      this.updateSky(this.timeToPos(time));
    }
  }
}
