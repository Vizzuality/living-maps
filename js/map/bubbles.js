
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

      this.getData();
      this._initBindings();

      return this;
    },

    _initBindings: function() {
      var self = this;
      
      this.map.on('move', function(ev) {
        for (var i in self.bubbles) {
          var bubble = self.bubbles[i];
          if (bubble.visible) {
            var pos = latlonTo3DPixel(self.map, [bubble.lat, bubble.lon]);
            bubble.$markup.css({
              top: pos.y - bubble.$markup.outerHeight(),
              left: pos.x - self.options.horizontalOffset
            })
          }
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

        this._bindMarkupEvents($markup, data.description);
      }

      // Check if it is already visible?
      if (this.bubbles.active) return false;

      // Calculate position
      var pos = latlonTo3DPixel(this.map, [data.lat, data.lon]);

      // Show it
      this._showBubble(this.bubbles[data.id], pos);
    },

    _showBubble: function(bubble, pos) {
      var self = this;

      // Set flag to visible
      bubble.visible = true;

      var hiding = setTimeout(function() {
        self._hideBubble(bubble);
        clearTimeout(hiding);
      }, (self.options.info.showTime + this.options.info.delayTime));

      // Bind mouseover
      bubble.$markup.find('.info').on('mouseenter', function(e) {
        e.preventDefault();
        e.stopPropagation();
        hiding && clearTimeout(hiding);
        self._bindOutBubble(bubble);
      })

      // Parent
      bubble.$markup.css({
        top: pos.y - bubble.$markup.outerHeight(),
        left: pos.x - this.options.horizontalOffset,
        display: 'block',
        opacity: 1
      });

      // Info
      bubble.$markup.find('.info')
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
      bubble.$markup.find('.shadow')
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

    _hideBubble: function(bubble) {
      // Unbind mouse events
      this._unbindBubble(bubble);

      // Info
      bubble.$markup.find('.info').animate({
          opacity:0,
          top:-100
        },
        this.options.info.hideTime,
        function() {
          bubble.$markup.hide();
        });

      // Shadow
      bubble.$markup.find('.shadow').fadeOut(this.options.shadow.hideTime);

      // Set visible to false
      setTimeout(function() {
        bubble.visible = false;
      }, this.options.info.hideTime);
    },

    _bindOutBubble: function(bubble) {
      var self = this;
      bubble.$markup.find('.info').off('mouseenter');
      bubble.$markup.find('.info').on('mouseleave', function(e){
        e.stopPropagation();
        e.preventDefault();
        self._hideBubble(bubble);
      });
    },

    _unbindBubble: function(bubble) {
      bubble.$markup.find('.info').off('mouseleave');
      bubble.$markup.find('.info').off('mouseenter');
    },

    _bindMarkupEvents: function($el, description) {
      $el.on("click", null, this, function(e) {
        e.preventDefault();
        var self = e.data;
        Events.trigger("openshare", description, self.map, self.city, App.time);
      });
    },

    _unbindMarkupEvents: function($el) {
      $el.off("click");
      $el.find('.info').off("mouseleave");
      $el.find('.info').off("mouseenter");
    },

    set_time: function(time) {
      var e = this.data.getFortime((time/60.0)>>0);
      
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
        self._unbindMarkupEvents(this.bubbles[i].$markup);
        this.bubbles[i].$markup.remove();
      }
      this.bubbles = [];
    }
  };