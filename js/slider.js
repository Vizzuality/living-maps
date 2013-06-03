function Slider(el, options, map, city) {
  var self = this;

  this.map = map;
  this.city = city;
  console.log(this.map, this.city);

  this.$el = el;
  this.$slider_container = $("#slider");

  this.options = {
    timeMin: options.timeMin,
    timeRange: options.timeRange
  };

  self.initialize();
}

Slider.prototype = {
  initialize: function() {
    var self = this;

    this.valueStop = 0;

    self.$el.slider();
    this._initBindings();
  },

  _initBindings: function() {
    var self = this;

    $(document).on("mouseup", function() {
      if(clicked) {
        self.valueStop = self.$el.slider("value");

        dragged = false;
        clicked = false;

        $(this).off('mousemove');
      }
    });

    this.$el
      .on("slide", function(event, ui) {
        self.onSlideStart(ui.value);
      })
      .on("slidestop", function(event, ui) {
        self.onSlideStop(ui.value);
      })
      .find("a")
        .on("mousedown", function() {
          Events.trigger("clickhandle", self.$el.slider("value"));
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
        .on("mouseenter", function() {
          self.$slider_container.addClass("glow");
        })
        .on("mouseleave", function() {
          self.$slider_container.removeClass("glow");
        });

    Events.on("clickhandle", function(val) {
      clicked = true;
      valueStart = val;

      self.$el.addClass("glow");

      $(document).on("mousemove", function() {
        dragged = true;
      });
    });

    Events.on("disableanimation", function(map, city, time) {
      self.options.city = city;
      self.options.map = map;

      Events.trigger("changetime", time * 60);

      self.$el.slider("value", self.timeToPos(time * 60));

      self.updateOddHour(time * 60);
      self.updateSky(self.timeToPos(time * 60));
    });
  },

  onSlideStart: function(pos) {
    var time = this.posToTime(pos);

    Events.trigger("changetime", time);

    this.updateHour(time);
    this.updateSky(pos);
  },

  onSlideStop: function(pos) {
    var time = this.posToTime(pos);
    var zoom = this.map.getZoom();

    this.$el.slider("value", pos);

    Events.trigger("changetime", time);

    this.updateHour(time);
    this.updateSky(pos);

    if(!stopped) {
      updateHash(this.map, this.city, window.AppData.init_time, zoom);
    } else {
      updateHash(this.map, this.city, App.time, zoom);
    }
  },

  add_graph: function(city) {
    var sql = 'https://pulsemaps.cartodb.com/api/v2/sql?q=SELECT avg(activity[i]) n, i FROM '+ city +', generate_series(1,96) i group by i order by i asc'
    $.getJSON(sql, function(data) {

      data = data.rows.map(function(r) { return r.n });
      $('#graph').html(graph(data, $('#sky').width(), 30, 'rgba(0, 0, 0, 0.1)'));
    });
  },

  updateHour: function(time) {
    var offset = new Date().getTimezoneOffset()*60*1000;
    var timeUpdated = new Date(this.options.timeMin + 1000 * time  + offset);
    var hours = timeUpdated.getHours();
    var minutes = timeUpdated.getMinutes();

    if(minutes%2 === 0) {
      minutes = (minutes<10?'0':'') + minutes;
      $("#hour").text(hours + ":" + minutes);
    };
  },

  updateOddHour: function(time) {
    var offset = new Date().getTimezoneOffset()*60*1000;
    var timeUpdated = new Date(this.options.timeMin + 1000 * time + offset);
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

    $(".day").css({
      "opacity": Math.sin(pos/Math.PI/10)
    });

    $(".night").css({
      "opacity": 1 - Math.sin(pos/Math.PI/10)
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
    this.$el.slider("value", this.timeToPos(time));

    this.updateHour(time);
    this.updateSky(this.timeToPos(time));
  },

  set_city: function(city, map) {
    this.city = city;
    this.map = map;
  },

  disable: function() {
    this.$el.off("slide")
      .off("slidestop")
      .find("a")
        .off("mousedown")
        .off("click");
  }
}
