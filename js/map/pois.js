var POIS = {

  pois: {},

  initialize: function(map, city) {
    this.map = map;
    this._initBinds();
    return this;
  },

  _initBinds: function() {
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
  },

  set_time: function() {

  },

  setCity: function() {

  }

}; // POIS