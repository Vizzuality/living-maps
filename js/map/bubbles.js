  
  /*
   *  City bubbles (GO GO GO!)
   */

  var Bubbles = {

    templates: {
      markup: " \
        <div class='bubble'> \
          <div class='info'> \
            <a href='#/go' class='go' data-description='<%= description %>'></a> \
            <span class='icon type <%= type %>'></span> \
            <p><%= description %></p> \
            <span class='tail'></span> \
          </div> \
          <div class='shadow'></div> \
        </div>"
    },

    options: {
      horizontalOffset: 140,
      shadow: {
        showTime: 300,
        hideTime: 600,
        delayTime: 1000
      },
      info: {
        showTime: 300,
        hideTime: 600,
        delayTime: 1000
      }
    },

    el: 'body',

    bubbles: {},

    initialize: function(map, city) {
      if(!map) throw "you should set map";
      this.map = map;
      this.city = city;

      this.data.fetch();
      this._initBindings();

      return this;
    },

    _initBindings: function() {
      var self = this;
      
      this.map.on('move', function(ev) {
        for (var i in self.bubbles) {
          var bubble = self.bubbles[i];
          if (bubble.$markup.is(':visible')) {
            var pos = latlonTo3DPixel(self.map, [bubble.lat, bubble.lon]);
            bubble.$markup.css({
              top: pos.y - bubble.$markup.outerHeight(),
              left: pos.x - self.options.horizontalOffset
            })
          }
        }
      });
    },

    data: new TimeBasedData({
      user: 'pulsemaps',
      table: 'bubbles',
      time_column: 'time',
      city: this.city,
      columns: ['cartodb_id as id', 'city', 'st_x(the_geom) as lon', 'time', 'st_y(the_geom) as lat', 'type', 'description']
    }),

    render: function() {},

    _emit: function(data) {
      var self = this;
      var $markup;

      if (!this.bubbles[data.id]) {
        var el = _.template(this.templates.markup)(data);
        $markup = $(el);
        $(this.el).append($markup);

        // Trick to get height :S
        $markup.css({
          display: 'block',
          opacity: 0
        });

        // Set height
        $markup.css({
          height: $markup.find('.info').height()
        });

        // Set absolute positioning to the info
        // to be animated
        $markup.find('.info').css({ position: 'absolute' })
        
        this.bubbles[data.id] = {
          $markup: $markup,
          lat: data.lat,
          lon: data.lon
        };

        this._bindMarkupEvents($markup);
      }
      
      var pos = latlonTo3DPixel(self.map, [data.lat, data.lon]);
      if (!$markup)
        $markup = this.bubbles[data.id].$markup;

      // Bubble
      $markup.css({
        top: pos.y - $markup.outerHeight(),
        left: pos.x - this.options.horizontalOffset,
        display: 'block',
        opacity: 1
      });

      // Info
      $markup.find('.info')
        .css({
          top: 100,
          display: 'block',
          opacity: 0
        })
        .animate({
            top: 0,
            opacity: 1
          },
          self.options.shadow.showTime,
          function() {
            $(this).delay(self.options.info.delayTime).animate({
                opacity:0,
                top:-100
              },
              self.options.info.hideTime,
              function() {
                $markup.hide();
              });
          }
        );

      // Shadow
      $markup.find('.shadow')
        .css({
          display: 'block',
          opacity: 0
        })
        .animate({
            opacity: 1
          },
          self.options.shadow.showTime,
          function() {
            $(this).delay(self.options.shadow.delayTime).fadeOut(self.options.shadow.hideTime);
          }
        );
    },

    _bindMarkupEvents: function($el) {
      var self = this;

      $el.find(".go").on("click", function(e) {
        e.preventDefault();
        var desc = $(e.target).data().description;
        Events.trigger("openshare", desc, self.map, self.city, App.time);
      });
    },

    _unbindMarkupEvents: function($el) {
      $el.find(".go").off("click");
    },

    set_time: function(time) {
      var e = this.data.getFortime((time/60.0)>>0);
      if(e) {
        this._emit(e);
      }
    },

    set_city: function(map, city) {
      // Set new city and map
      this.city = city;
      this.map = map;

      // Clean bubbles
      this.clean();

      // Get new data
      this.data.fetch();
    },

    clean: function() {
      var self = this;
      for (var i in this.bubbles) {
        self._unbindMarkupEvents(this.bubbles[i].$markup);
        this.bubbles[i].$markup.remove();
      }
      this.bubbles = [];
    }
  };