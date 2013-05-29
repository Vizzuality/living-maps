
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
  var geom = (this.options.geometry) ? " AND the_geom IS NOT NULL" : '';

  var url = this.base_url + "?q=" + "SELECT " + sel + " FROM " + this.options.table + " WHERE city='" + this.options.city + "'" + geom;

  $.getJSON(url, function(data) {
    self.reset(data.rows, callback);
  });
}
