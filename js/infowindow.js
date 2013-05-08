
function TimeBasedData(options) {
  if(!options.table) throw "you should set options.table";
  options.user = options.user || 'pulsemaps';
  options.time_column = options.time_column || 'time';
  options.columns = options.columns || ['*'];
  this.options = options;
  this.options.url = 'http://' + this.options.user + '.cartodb.com//api/v2/sql';
  this.time_index = {};
}

TimeBasedData.prototype.reset = function(data, callback) {
  this.entries = data;
  var time = this.options.time_column;

  // generate index by time
  this.time_index = {};
  for(var i = 0; i < this.entries.length; ++i) {
    var e = this.entries[i];
    this.time_index[e[time]] = e;
  }

  callback && callback();
}

// time - integer
TimeBasedData.prototype.getFortime = function(time) {
  return this.time_index[time];
}

TimeBasedData.prototype.fetch = function(callback) {
  var self = this;
  this.base_url = this.options.url;

  var sel = this.options.columns.join(',');

  $.getJSON(this.base_url + "?q=" + "SELECT " + sel + " FROM " + this.options.table, function(data) {
    self.reset(data.rows, callback);
  });
}


var Bubbles = {

  bubbles: {},

  initialize: function(map) {
    if(!map) throw "you should set map";
    this.map = map;
    this.backdrop = $("#backdrop");
    this.slider = $("#slider");
    this.tweet = $(".tweet");
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
    columns: ['cartodb_id as id', 'st_x(the_geom) as lon', 'time', 'st_y(the_geom) as lat', 'type', 'sentence', 'tweet']
  }),

  render: function() {},

  _emit: function(data) {
    var self = this;
    var $markup;

    if (!this.bubbles[data.id]) {
      $markup = $('<div class="bubble type_' + data.type + '"><p>' + data.sentence + '</p><a href="#" class="go" data-tweet="' + data.tweet + '"></a></div><div class="bubble_shadow"></div>');
      
      $('body').append($markup);
      
      this.bubbles[data.id] = {
        $markup: $markup,
        lat: data.lat,
        lon: data.lon
      };    

      $(".go").on("click", function(e) {
        e.preventDefault();
        Events.trigger("stopanimation");
        self.showBackdrop($(this).attr("data-tweet"));
      });

      $(".cancel, .send").on("click", function(e) {
        e.preventDefault();
        Events.trigger("resumeanimation", self.slider.slider("value"));
        self.backdrop.fadeOut(200);
      });
    }
    
    var pos = this.map.latLngToContainerPoint([data.lat, data.lon]);
    $markup = this.bubbles[data.id].$markup;

    $($markup[0]).css({
      top: pos.y,
      left: pos.x,
      marginTop: '30px',
      display: 'block',
      opacity: 0
    });

    $($markup[1]).css({
      top: pos.y,
      left: pos.x,
      marginTop: '190px',
      display: 'block',
      opacity: 0
    });

    $($markup[0]).animate({
      marginTop:0,
      opacity: 1
    }, 300, function() {
      $(this).delay(1000).animate({
        marginTop: '-30px',
        opacity: 0
      }, {
        duration: 600,
        wait: true,
        complete: function(a,b,c) {
          $(this).css('display','none');
        }
      })
    });

    $($markup[1]).animate({
      opacity: 1
    }, 300, function() {
      $(this).delay(1000).animate({
        opacity: 0
      }, {
        duration: 600,
        wait: true,
        complete: function(a,b,c) {
          $(this).css('display','none');
        }
      })
    });
  },

  showBackdrop: function(tweet) {
    this.tweet.text(tweet);
    this.backdrop.fadeIn(200);
  },

  set_time: function(time) {
    var e = this.data.getFortime((time/60.0)>>0);
    if(e) {
      this._emit(e);
    }
  }

}; // Bubbles


var ContextualFacts = {

  contextualFacts: {},

  initialize: function(map) {
    if(!map) throw "you should set map";
    this.map = map;
    this.slider = $("#slider");
    return this;
  },

  data: new TimeBasedData({
    user: 'pulsemaps',
    table: 'contextualfacts',
    time_column: 'time',
    columns: ['cartodb_id as id', 'time', 'sentence']
  }),

  render: function() {},

  _emit: function(data) {
    var self = this;
    var $markup;

    if (!this.contextualFacts[data.id]) {
      var $markup = $('<p class="time">' + data.sentence + '</p>');
      this.contextualFacts[data.id] = {
        $markup: $markup
      };
      $('#contextualfacts').append($markup);
    }

    $markup = this.contextualFacts[data.id].$markup;

    $markup.css({
      marginTop: '30px',
      display: 'block',
      opacity: 0
    });

    $markup.animate({
      marginTop:0,
      opacity: 1
    }, 300, function() {
      $(this).delay(2000).animate({
        marginTop: '-30px',
        opacity: 0
      }, {
        duration: 300
      })
    });
  },

  set_time: function(time) {
    var e = this.data.getFortime((time/60.0)>>0);
    if(e) {
      this._emit(e);
    }
  }

}; // Contextual Facts


var POIS = {

  pois: {},

  initialize: function(map) {
    this.map = map;
    this._initBinds();
    return this;
  },

  _initBinds: function() {
    var self = this;
    this.map.on('move', function() {
      for (var i in self.pois) {
        var poi = self.pois[i];
        var pos = self.map.latLngToContainerPoint([poi.lat, poi.lon]);
        poi.$markup.css({
          top: pos.y,
          left: pos.x
        })
      }
    });
  },

  data: new TimeBasedData({
    user: 'pulsemaps',
    table: 'pois',
    time_column: 'time',
    columns: ['cartodb_id as id', 'st_x(the_geom) as lon', 'name', 'time as time', 'st_y(the_geom) as lat', 'type']
  }),

  render: function() {
    var self = this;
    setTimeout(function() {
      for (var i in self.data.time_index) {
        var _data = self.data.time_index[i];
        self._emit(_data);
      }  
    },500)
  },

  _emit: function(data) {
    var self = this;
    var $markup;

    if (!this.pois[data.id]) {
      $markup = $('<div class="poi type_' + data.type + '"><span class="' + data.type + '"></span><p><strong>' + data.name + '</strong></p></div>');
      
      $('body').append($markup);
      
      this.pois[data.id] = {
        $markup: $markup,
        lat: data.lat,
        lon: data.lon
      }
    }
    
    var pos = this.map.latLngToContainerPoint([data.lat, data.lon]);
    $markup = this.pois[data.id].$markup;

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
    }, 300);
  }

}; // POIS
