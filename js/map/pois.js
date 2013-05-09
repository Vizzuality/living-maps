var POIS = {

  pois: {},

  initialize: function(map, city) {
    this.map = map;
    this._initBindings();
    return this;
  },

  _initBindings: function() {
    var self = this;
    
    this.map.on('move', function() {
      for (var i in self.pois) {
        var poi = self.pois[i];
        var pos = latlonTo3DPixel(self.map, [poi.lat, poi.lon]);
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
    city: this.city,
    columns: ['cartodb_id as id', 'st_x(the_geom) as lon', 'name', 'city', 'time as time', 'st_y(the_geom) as lat', 'type']
  }),

  render: function() {
    var self = this;
    setTimeout(function() {
      for (var i in self.data.time_index) {
        var _data = self.data.time_index[i];
        self._emit(_data);
      }  
    },1000)
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
    
    var pos = latlonTo3DPixel(this.map, [data.lat, data.lon]);
    $markup = this.pois[data.id].$markup;

    $markup.css({
      top: pos.y,
      left: pos.x
    });
  },

  set_city: function(city) {
    // Set new city
    this.city = city;

    // Reset markups
    for (var i in this.pois) {
      this.pois[i].$markup.remove();
    }
    this.pois = [];

    // Get new data
    this.data.fetch();
  }

}; // POIS