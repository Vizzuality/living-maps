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
  },

  updateHour: function(time) {
    var self = this;

    var timeUpdated = new Date(this.options.timeMin + 1000 * time);
    var hours = timeUpdated.getHours();
    var minutes = timeUpdated.getMinutes();

    minutes = (minutes<10?'0':'') + minutes;

    $("#hour").text(hours + ":" + minutes);
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
    }
  }
}
