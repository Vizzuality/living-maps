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

    // init slider
    this.el.slider({
      change: function(event, ui) {},
      stop: function(event, ui) {}
    });

    this.el.on("mouseenter", function() {
      $("#selectors").addClass("glow");
    });

    this.el.on("mouseleave", function() {
      $("#selectors").removeClass("glow");
    });

    this.el.on("mousedown", function() {
      self.clicked = true;
    });

    this.el.on("slidestop", function(event, ui) {
      self.onSlideStop(ui.value);
    });
  },

  onSlideStop: function(pos) {
    var time = this.posToTime(pos);
    this.clicked = false;

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
    var w = $(".sky").width();

    $("#sun").css({"left": (pos*w/100) + "px", top: 75 + ((Math.sin((pos+50)/20) * 30) * w / 100) + "px"});
    $("#moon").css({"left": 95 + (pos*w/100) + "px", top: 75 + ((Math.sin((pos+50)/20) * 30) * w / 100) * -1 + "px"});
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
    if(!this.clicked){
      this.el.slider("value", this.timeToPos(time));
    
      this.updateHour(time);
      this.updateSky(this.timeToPos(time));
    }
  }
}
