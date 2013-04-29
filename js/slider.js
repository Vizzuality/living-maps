function Slider(el, options) {
  this.el = el;
  this.options = {
    timeMin: options.timeMin,
    timeRange: options.timeRange
  };

  /*_.defaults(options, {
   step: 15,
   timeRange: 300
  });*/

  this.initialize();
}

Slider.prototype = {
  initialize: function() {
    var self = this;

    // init slider
    this.el.slider({
      change: function(event, ui) {}
    });

    // bind slider
    this.el.on("slidechange", function(event, ui) {
      self.onSliderChange();
    });
  },

  onSliderChange: function() {
    var self = this;

    var timeUpdated = new Date(this.options.timeMin + 1000 * self.posToTime(self.el.slider("value")));
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
    this.el.slider("value", this.timeToPos(time));
  }
}
