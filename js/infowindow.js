
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
    return this;
  },

  data: new TimeBasedData({
    user: 'pulsemaps',
    table: 'infowindows',
    time_column: 'time',
    columns: ['st_x(the_geom) as lon', 'time', 'st_y(the_geom) as lat', 'type', 'sentence']
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

    markup.fadeIn(200);

    this.bubbles[data.id] = markup;
    setTimeout(function() {
      markup.delay(1000).fadeOut(200, function(){
        $(this).remove();
      });
      delete self.bubbles[data.id];
    }, 3000);

    $(".bubble").on("click", function(e) {
      e.preventDefault();
      Events.trigger("stopanimation");
      self.backdrop.fadeIn(200);
    });

    $(".cancel, .send").on("click", function(e) {
      e.preventDefault();
      Events.trigger("resumeanimation", self.slider.slider("value"));
      self.backdrop.delay(400).fadeOut(200);
    });
  },

  set_time: function(time) {
    var e = this.data.getFortime((time/60.0)>>0);
    if(e) {
      this._emit(e);
    }
  }

}; // Bubbles
