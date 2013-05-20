  
  /*
   *  City POIS
   */

  var POIS = {

    templates: {
      markup: "\
        <div class='poi type_<%= type %>'> \
          <span class='<%= type %>'></span> \
          <p><strong><%= name %></strong></p> \
        </div>"
    },

    options: {
      horizontalOffset: 0,
      maxHeight: 141,
      topEdgeMargin: 340
    },

    el: '.map_components',

    pois: {},

    initialize: function(map, city) {
      this.map = map;
      this.city = city;

      this.getData();
      this._initBindings();
      this._bindStart();

      return this;
    },

    _initBindings: function() {
      var self = this;
      
      this.map.on('move', function() {
        for (var i in self.pois) {
          var poi = self.pois[i];
          if (poi) {

            var pos = latlonTo3DPixel(self.map, [poi.lat, poi.lon]);
            var _opacity = 1;
            if(pos.y < self.options.topEdgeMargin){
              var _op = (1/(self.options.topEdgeMargin-pos.y))*10;
              _opacity = (_op < 0.08) ? 0 : _op;
            }
            poi.$markup.css({
              top: pos.y - (self.options.maxHeight / poi.heightrank),
              left: pos.x - self.options.horizontalOffset,
              opacity: _opacity
            })
          }
        }
      });

      this.map.on('zoomend', function() {
        self._filterPois();
      });
    },

    _filterPois: function() {
      for (var i in this.pois) {
        this._filterPoi(this.pois[i]);
      }
    },

    _filterPoi: function(poi) {
      var start_zoom = window.AppData.CITIES[this.city].map.zoom;
      var actual_zoom = this.map.getZoom();
      var index = (start_zoom == actual_zoom || start_zoom > actual_zoom) ? 1 : 5;
      poi.$markup.css('display', (index < poi.labelrank) ? 'none' : 'block');
    },

    _bindStart: function() {
      Events.once("animationenabled", this.render, this);
    },

    getData: function() {
      var self = this;

      this.data = new TimeBasedData({
        user: 'pulsemaps',
        table: 'pois',
        time_column: 'id',
        city: this.city,
        geometry: true,
        columns: ['cartodb_id as id', 'st_x(the_geom) as lon', 'st_y(the_geom) as lat', 'heightrank', 'labelrank', 'name', 'city', 'type']
      });

      this.data.fetch(function() {
        self.render();
      });
    },

    render: function() {
      var self = this;
      for (var i in this.data.time_index) {
        var _data = self.data.time_index[i];
        self._emit(_data);
      }
    },

    _emit: function(data) {
      var self = this;
      var $markup;

      if (!this.pois[data.id]) {
        var el = _.template(this.templates.markup)(data);
        var $markup = $(el);

        // Set height
        $markup.height(this.options.maxHeight / data.heightrank);
        $(this.el).append($markup);
        
        this.pois[data.id] = {
          $markup: $markup,
          lat: data.lat,
          lon: data.lon,
          labelrank: data.labelrank,
          heightrank: data.heightrank
        }

        // Filter poi by zoom
        this._filterPoi(this.pois[data.id]);
      }
      
      var pos = latlonTo3DPixel(this.map, [data.lat, data.lon]);
      if (!$markup)
        $markup = this.pois[data.id].$markup;

      if(pos.y < this.options.topEdgeMargin){
        var _op = (1/(this.options.topEdgeMargin-pos.y))*10;
        var _opacity = (_op < 0.08) ? 0 : _op;
      }

      $markup.css({
        top: pos.y - (this.options.maxHeight / data.heightrank),
        left: pos.x - this.options.horizontalOffset,
        opacity: _opacity
      });
    },

    set_city: function(city) {
      var self = this;

      // Set new city
      this.city = city;
      this.data.options.city = city;

      // Clean markups
      this.clean();

      // Bind start
      this._bindStart();

      // Get new data
      this.data.fetch(function() {
        self.render();
      });
    },

    clean: function() {
      for (var i in this.pois) {
        this.pois[i].$markup.remove();
      }
      this.pois = [];
    }
  };