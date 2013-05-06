
function TimeBasedData(options) {
  if(!options.table) throw "you should set options.table";
  options.user = options.user || 'pulsemaps';
  options.time_column = options.time_column || 'time';
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
  $.getJSON(this.base_url + "?q=" + "SELECT * FROM " + this.options.table, function(data) {
    self.reset(data.rows);
  });
}


var Bubbles = {

  bubbles: {},

  initialize: function(map) {
    if(!map) throw "you should set map";
    this.map = map;
    return this;
  },

  data: new TimeBasedData({
    user: 'pulsemaps',
    table: 'infowindows',
    time_column: 'time'
  }),

  render: function() {},

  _emit: function(data) {
    if(this.bubbles[data.id]) return;
    var self = this;

    var markup = $('<div class="bubble type_' + data.type + '"><p>' + data.sentence + '</p><a href="#" class="go"></a></div>');
    $('body').append(markup);
    var pos = this.map.latLngToContainerPoint([data.lat, data.lon]);
    markup.css({
      top: pos.y,
      left: pos.x
    });

    this.bubbles[data.id] = markup;
    setTimeout(function() {
      markup.fadeOut().remove();
      delete self.bubbles[data.id];
    }, 3000);
  },

  set_time: function(time) {
    var e = this.data.getFortime((time/60.0)>>0);
    if(e) {
      this._emit(e);
    }
  }

}; // Bubbles
