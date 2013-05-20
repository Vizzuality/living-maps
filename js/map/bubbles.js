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
    random: false, // Random bubble appearance 
    horizontalOffset: 140,
    topEdgeMargin: 340,
    animation: {
      animShowTime: 300,
      animHideTime: 600,
      animDelayTime: 3000,
      slowShowTime: 1000,
      slowHideTime: 2500,
      slowShowTime: 1800,
      slowAppTime: 1.0
    }
  },

  // States to reproduce when bubble appears
  states: {
    0: '_showBubble',
    1: '_waitBubble',
    2: '_hideBubble'
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
        if (bubble && bubble.lat && bubble.lon) {
          
          var pos = latlonTo3DPixel(self.map, [bubble.lat, bubble.lon]);
          var _opacity = 1;
          if(pos.y < self.options.topEdgeMargin){
            var _op = (1/(self.options.topEdgeMargin-pos.y))*10;
            _opacity = (_op < 0.08) ? 0 : _op;
          }

          bubble.$markup.css({
            top: pos.y - bubble.$markup.outerHeight(),
            left: pos.x - self.options.horizontalOffset,
            opacity: _opacity
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
      geometry: true,
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
      this.bubbles[data.id] = {};
    }

    // If it shouldn't appear taking into account the random thingy
    if (this.options.random) {
      if (this.last_active) {
        this.last_active = !this.last_active;
        return false;
      } else {
        this.last_active = !this.last_active;
      }
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

    // Bind events
    this._bindBubble(data.id);

    // Show it
    this._showBubble(data.id, pos);
  },


  _bindBubble: function(bubble_id) {
    var self = this;
    self.bubbles[bubble_id].$markup
      .find('.info')
      .hover(function() {
        self.bubbles[bubble_id].over = true;
        self[self.states[self.bubbles[bubble_id].state]](bubble_id);
      }, function() {
        self.bubbles[bubble_id].over = false;
        self[self.states[self.bubbles[bubble_id].state]](bubble_id);
      })
      .on('click', function() {
        Events.trigger("openshare", self.bubbles[bubble_id].description, self.map, self.city, App.time);
      })
  },

  _unbindBubble: function(bubble_id) {
    if (this.bubbles[bubble_id]) {
      this.bubbles[bubble_id].$markup
        .find('.info')
        .off('mouseenter')
        .off('mouseleave')
        .off('click');
    }
  },

  _showBubble: function(bubble_id, pos) {
    var self = this;

    // Set new state
    this.bubbles[bubble_id].state = 0;

    // Set app scale
    Events.trigger(
      "changeappscale",
      this.bubbles[bubble_id].over
        ? this.options.animation.slowAppTime
        : (AppData.CITIES[this.city].scale || 2.0)
    );

    /* Animation */
    // Parent
    if (pos) {
      this.bubbles[bubble_id].$markup.css({
        top: pos.y - this.bubbles[bubble_id].$markup.outerHeight(),
        left: pos.x - this.options.horizontalOffset,
        display: 'block',
        opacity: 1
      });  
    }

    // Calculate time depending how much has been animated
    var done = parseFloat(this.bubbles[bubble_id].$markup.find('.info').css('opacity'));
    var unanim = 1 - done;

    // Info
    this.bubbles[bubble_id].$markup
      .find('.info')
      .stop(true)
      .animate({
          top: 0,
          opacity: 1
        },
        (this.bubbles[bubble_id].over)
          ? this.options.animation.slowShowTime * unanim
          : this.options.animation.animShowTime * unanim,
        function() {
          self._waitBubble(bubble_id);
        }
      );

    // Shadow
    this.bubbles[bubble_id].$markup
      .find('.shadow')
      .stop(true)
      .animate({
          opacity: 1
        },
        (this.bubbles[bubble_id].over)
          ? this.options.animation.slowShowTime * unanim
          : this.options.animation.animShowTime * unanim
      );
  },

  _waitBubble: function(bubble_id) {
    var self = this;

    // Set new state
    this.bubbles[bubble_id].state = 1;

    // Set app scale
    Events.trigger(
      "changeappscale",
      this.bubbles[bubble_id].over
        ? this.options.animation.slowAppTime
        : (AppData.CITIES[this.city].scale || 2.0)
    );

    // Calculate time depending how much has been animated
    var done = parseFloat(this.bubbles[bubble_id].$markup.find('.info').css('top').replace('px', ''));
    var unanim = 1 - (( 1 * done ) / 10 );

    // Wait bubble in slow motion or normal
    this.bubbles[bubble_id].$markup
      .find('.info')
      .stop(true)
      .animate({
          top: 10
        },
        (this.bubbles[bubble_id].over)
          ? this.options.animation.slowDelayTime * unanim
          : this.options.animation.animDelayTime * unanim,
        function() {
          self._hideBubble(bubble_id);
        }
      );
  },

  _hideBubble: function(bubble_id) {
    var self = this;

    // Set new state
    this.bubbles[bubble_id].state = 2;

    // Set app scale
    Events.trigger(
      "changeappscale",
      this.bubbles[bubble_id].over
        ? this.options.animation.slowAppTime
        : (AppData.CITIES[this.city].scale || 2.0)
    );

    /* Animation */

    // Calculate time depending how much has been animated
    var done = parseFloat(this.bubbles[bubble_id].$markup.find('.info').css('opacity'));
    var unanim = done;

    // Info
    this.bubbles[bubble_id].$markup
      .find('.info')
      .stop(true)
      .animate({
          top: -100,
          opacity: 0
        },
        (this.bubbles[bubble_id].over)
          ? this.options.animation.slowHideTime * unanim
          : this.options.animation.animHideTime * unanim,
        function() {
          self._removeBubble(bubble_id);
        }
      );

    // Shadow
    this.bubbles[bubble_id].$markup
      .find('.shadow')
      .stop(true)
      .animate({
          opacity: 0
        },
        (this.bubbles[bubble_id].over)
          ? this.options.animation.slowHideTime
          : this.options.animation.animHideTime
      );
  },

  _removeBubble: function(bubble_id) {
    if (this.bubbles[bubble_id]) {
      if (this.bubbles[bubble_id].over) {
        // Set app scale
        Events.trigger("changeappscale", AppData.CITIES[this.city].scale);
        this.bubbles[bubble_id].over = false;
      }
      this._unbindBubble(bubble_id);
      this.bubbles[bubble_id].$markup.remove();
      delete this.bubbles[bubble_id];
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
      self._removeBubble(i);
    }
    this.bubbles = [];
  }
};