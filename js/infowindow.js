
function TimeBasedData(options) {
  if(!options.table) throw "you should set options.table";
  options.user = options.user || 'pulsemaps';
  options.time_column = options.time_column || 'time';
  options.columns = options.columns || ['*'];
  this.options = options;
  this.options.url = 'http://' + this.options.user + '.cartodb.com//api/v2/sql';
  this.time_index = {};
}

TimeBasedData.prototype.reset = function(data) {
  this.entries = data;
  var time = this.options.time_column;

  // generate index by time
  this.time_index = {};
  for(var i = 0; i < this.entries.length; ++i) {
    var e = this.entries[i];
    this.time_index[e[time]] = e;
  }
}

// time - integer
TimeBasedData.prototype.getFortime = function(time) {
  return this.time_index[time];
}


TimeBasedData.prototype.fetch = function() {
  self = this;
  this.base_url = this.options.url;

  var sel = this.options.columns.join(',');

  $.getJSON(this.base_url + "?q=" + "SELECT " + sel + " FROM " + this.options.table, function(data) {
    self.reset(data.rows);
  });
}


var Bubbles = {

  bubbles: {},

  initialize: function(map) {
    if(!map) throw "you should set map";
    this.map = map;
    this.backdrop = $("#backdrop");
    this.slider = $("#slider");

    this._initBinds();
    return this;
  },

  _initBinds: function() {
    var self = this;
    this.map.on('move', function() {
      for (var i in self.bubbles) {
        var bubble = self.bubbles[i];
        if (bubble.$markup.is(':visible')) {
          var pos = self.map.latLngToContainerPoint([bubble.lat, bubble.lon]);
          bubble.$markup.css({
            top: pos.y,
            left: pos.x
          })
        }
      }
    });
  },

  data: new TimeBasedData({
    user: 'pulsemaps',
    table: 'infowindows',
    time_column: 'time',
    columns: ['cartodb_id as id', 'st_x(the_geom) as lon', 'time', 'st_y(the_geom) as lat', 'type', 'sentence']
  }),

  render: function() {},

  _emit: function(data) {
    var self = this;
    var $markup;

    if (!this.bubbles[data.id]) {
      $markup = $('<div class="bubble type_' + data.type + '"><p>' + data.sentence + '</p><a href="#" class="go"></a></div>');
      
      $('body').append($markup);
      
      this.bubbles[data.id] = {
        $markup: $markup,
        lat: data.lat,
        lon: data.lon
      };    

      $(".bubble").on("click", function(e) {
        e.preventDefault();
        Events.trigger("stopanimation");
        self.backdrop.fadeIn(200);
      });

      $(".cancel, .send").on("click", function(e) {
        e.preventDefault();
        Events.trigger("resumeanimation", self.slider.slider("value"));
        self.backdrop.fadeOut(200);
      });
    }
    
    var pos = this.map.latLngToContainerPoint([data.lat, data.lon]);
    $markup = this.bubbles[data.id].$markup;

    $markup.css({
      top: pos.y,
      left: pos.x,
      marginTop: '30px',
      display: 'block',
      opacity: 0
    });

    $markup.animate({
      marginTop:0,
      opacity: 1
    }, 300, function() {
      $(this).delay(500).animate({
        marginTop: '-30px',
        opacity: 0
      }, {
        duration: 600,
        wait: true
      })
    });
  },

  set_time: function(time) {
    var e = this.data.getFortime((time/60.0)>>0);
    if(e) {
      this._emit(e);
    }
  }

}; // Bubbles
