function Slider(el, options) {
  // in minutes
  var sliderPos = 0;
  var timeRange = 300;
  var step = 15;

  var timeMin = Date.now();
  var timeMax = timeMin + (timeRange * 60000);
  
  

  this.el = el;
  this.options = _.defaults(options, {
   step: 15,
   timeRange: 300
  });

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
      var timeUpdated = new Date(self.options.timeMin + self.timeNow(self.slider("value")));
      var hours = timeUpdated.getHours();
      var minutes = timeUpdated.getMinutes();

      minutes = (minutes<10?'0':'') + minutes;

      $("#hour").text(hours + ":" + minutes);
    });
  },
  
  timeNow: function(t) {
    return t * this.options.timeRange / 100 * 60000;
  }

  update: function(dt) {
    
  },

  render: function() { // empty on purpose
    
  },

  set_time: function(date) {
    
  }
}


