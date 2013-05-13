
  /*
   *  City bubbles (GO GO GO!)
   */

  var Bubbles = {

    templates: {
      markup: " \
        <div class='bubble'> \
          <div class='info'> \
            <a href='#/go' class='go'></a> \
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
        delayTime: 1800
      },
      info: {
        showTime: 300,
        hideTime: 600,
        delayTime: 1800
      }
    },

    el: '.map_components',

    bubbles: {},

    initialize: function(map, city) {
      if(!map) throw "you should set map";
      this.map = map;
      this.city = city;

      // Random thingy
      this.last_time = 0;
      this.last_active = false;

      this.getData();
      this._initBindings();

      return this;
    },

    _initBindings: function() {
      var self = this;
      
      this.map.on('move', function(ev) {
        for (var i in self.bubbles) {
          var bubble = self.bubbles[i];
          var pos = latlonTo3DPixel(self.map, [bubble.lat, bubble.lon]);
          bubble.$markup.css({
            top: pos.y - bubble.$markup.outerHeight(),
            left: pos.x - self.options.horizontalOffset
          })
        }
      });
    },

    getData: function() {
      this.data = new TimeBasedData({
        user: 'pulsemaps',
        table: 'bubbles',
        time_column: 'time',
        city: this.city,
        columns: ['cartodb_id as id', 'city', 'st_x(the_geom) as lon', 'time', 'st_y(the_geom) as lat', 'type', 'description']
      });
      this.data.fetch();
    },

    render: function() {},

    _emit: function(data) {
      var self = this;
      var $markup;

      // If it is already in the dom...
      if (this.bubbles[data.id]) {
        return false;
      } else {
        // [tricky] Fake content before the true content
        this.bubbles[data.id] = true;
      }

      // If it shouldn't appear taking into account the random thingy
      if (this.last_active) {
        this.last_active = !this.last_active;
        return false;
      } else {
        this.last_active = !this.last_active;
      }

      // If now, creates the markup and so on
      var el = _.template(this.templates.markup)(data);
      $markup = $(el);
      $(this.el).append($markup);

      // Trick to get height :S
      $markup.css({
        display: 'block',
        opacity: 0
      });

      // Set height
      $markup.css({ height: $markup.find('.info').height() });

      // Set absolute positioning to the info
      // to be animated
      $markup.find('.info').css({ position: 'absolute' })
      
      // Save bubble
      this.bubbles[data.id] = {
        $markup: $markup,
        lat: data.lat,
        lon: data.lon,
        description: data.description
      };

      // Calculate position
      var pos = latlonTo3DPixel(this.map, [data.lat, data.lon]);

      // Show it
      this._showBubble(data.id, pos);
    },

    _showBubble: function(bubble_id, pos) {
      var self = this;

      // Automatic hide
      var hiding = setTimeout(function() {
        self._hideBubble(bubble_id);
        clearTimeout(hiding);
      }, (self.options.info.showTime + this.options.info.delayTime));

      // Bind events
      this.bubbles[bubble_id].$markup.on("click", function(e) {
        e.preventDefault();
        Events.trigger("openshare", self.bubbles[bubble_id].description, self.map, self.city, App.time);
      });

      this.bubbles[bubble_id].$markup.find('.info').on('mouseenter', function(e) {
        e.preventDefault();
        e.stopPropagation();
        hiding && clearTimeout(hiding);
        self._bindMouseOutBubble(bubble_id);
      })

      // Parent
      this.bubbles[bubble_id].$markup.css({
        top: pos.y - this.bubbles[bubble_id].$markup.outerHeight(),
        left: pos.x - this.options.horizontalOffset,
        display: 'block',
        opacity: 1
      });

      // Info
      this.bubbles[bubble_id].$markup.find('.info')
        .css({
          top: 100,
          display: 'block',
          opacity: 0
        })
        .animate({
            top: 0,
            opacity: 1
          },
          self.options.shadow.showTime
        );

      // Shadow
      this.bubbles[bubble_id].$markup.find('.shadow')
        .css({
          display: 'block',
          opacity: 0
        })
        .animate({
            opacity: 1
          },
          self.options.shadow.showTime
        );
    },

    _hideBubble: function(bubble_id) {
      // Info
      this.bubbles[bubble_id].$markup.find('.info').animate({
          opacity:0,
          top:-100
        },
        this.options.info.hideTime);

      // Shadow
      this.bubbles[bubble_id].$markup.find('.shadow').fadeOut(this.options.shadow.hideTime);

      // Set visible to false
      var self = this;
      setTimeout(function() {
        self._removeBubble(bubble_id);
      }, this.options.info.hideTime);
    },

    _removeBubble: function(bubble_id) {
      if (this.bubbles[bubble_id]) {
        this._unbindMarkupEvents(bubble_id);
        this.bubbles[bubble_id].$markup.remove();
        delete this.bubbles[bubble_id];
      }
    },

    _bindMouseOutBubble: function(bubble_id) {
      if (this.bubbles[bubble_id]) {
        var bubble = this.bubbles[bubble_id];
        var self = this;
        bubble.$markup.find('.info').off('mouseenter');
        bubble.$markup.find('.info').on('mouseleave', function(e){
          e.stopPropagation();
          e.preventDefault();
          self._hideBubble(bubble_id);
        });
      }
    },

    _unbindMarkupEvents: function(bubble_id) {
      if (this.bubbles[bubble_id]) {
        var bubble = this.bubbles[bubble_id];
        bubble.$markup.off("click");
        bubble.$markup.find('.info').off("mouseleave");
        bubble.$markup.find('.info').off("mouseenter");  
      }
    },

    set_time: function(time) {
      var e = this.data.getFortime((time/60.0)>>0);

      if (this.last_time > time) {
        this.last_active = !this.last_active;
      }

      this.last_time = time;
      
      if (e) {
        this._emit(e); 
      }
    },

    set_city: function(city) {
      // Set new city
      this.city = city;
      this.data.options.city = city;

      // Clean bubbles
      this.clean();

      // Get new data
      this.data.fetch();
    },

    clean: function() {
      var self = this;
      for (var i in this.bubbles) {
        self._unbindMarkupEvents(i);
        this.bubbles[i].$markup.remove();
      }
      this.bubbles = [];
    }
  };