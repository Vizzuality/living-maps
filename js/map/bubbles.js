var Bubbles = {

  bubbles: {},

  initialize: function(map, city) {
    if(!map) throw "you should set map";
    this.map = map;
    this.city = city;
    this.backdrop = $("#backdrop");
    this.slider = $("#slider");
    this.tweet = $(".tweet");
    this.tweet_button = $(".send");

    this.horizontalOffset = 110;
    this.verticalOffset = 170;

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
            top: pos.y - self.verticalOffset,
            left: pos.x - self.horizontalOffset
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
    columns: ['cartodb_id as id', 'city', 'st_x(the_geom) as lon', 'time', 'st_y(the_geom) as lat', 'type', 'description', 'tweet']
  }),

  render: function() {},

  _emit: function(data) {
    var self = this;
    var $markup;

    if (!this.bubbles[data.id]) {
      $markup = $('<div class="bubble type_' + data.type + '"><p>' + data.description + '</p><a href="#" class="go" data-tweet="' + data.tweet + '"></a></div><div class="bubble_shadow"></div>');
      
      $('body').append($markup);
      
      this.bubbles[data.id] = {
        $markup: $markup,
        lat: data.lat,
        lon: data.lon
      };    

      $markup.find(".go").on("click", function(e) {
        e.preventDefault();
        Events.trigger("stopanimation");
        self.showBackdrop($(this).attr("data-tweet"));
      });

      $markup.find(".cancel, .send").on("click", function(e) {
        e.preventDefault();
        Events.trigger("resumeanimation");
        self.backdrop.fadeOut(200);
      });
    }
    
    var pos = latlonTo3DPixel(self.map, [data.lat, data.lon]);
    $markup = this.bubbles[data.id].$markup;

    $($markup[0]).css({
      top: pos.y - this.verticalOffset,
      left: pos.x - this.horizontalOffset,
      marginTop: '30px',
      display: 'block',
      opacity: 0
    });

    $($markup[1]).css({
      top: pos.y - this.verticalOffset,
      left: pos.x - this.horizontalOffset,
      marginTop: '190px',
      display: 'block',
      opacity: 0
    });

    $($markup[0]).animate({
      marginTop:0,
      opacity: 1
    }, 300, function() {
      $(this).delay(1000).animate({
        marginTop: '-30px',
        opacity: 0
      }, {
        duration: 600,
        wait: true,
        complete: function(a,b,c) {
          $(this).css('display','none');
        }
      })
    });

    $($markup[1]).animate({
      opacity: 1
    }, 300, function() {
      $(this).delay(1000).animate({
        opacity: 0
      }, {
        duration: 600,
        wait: true,
        complete: function(a,b,c) {
          $(this).css('display','none');
        }
      })
    });
  },

  showBackdrop: function(tweet) {
    this.tweet.text(tweet);
    this.tweet_button.attr("href", "http://twitter.com/share?text=" + tweet);
    this.backdrop.fadeIn(200);
  },

  set_time: function(time) {
    var e = this.data.getFortime((time/60.0)>>0);
    if(e) {
      this._emit(e);
    }
  },

  setCity: function(city) {
    // Set new city
    this.city = city;

    // Reset markups
    for (var i in this.bubbles) {
      this.bubbles[i].$markup.find(".go").off("click");
      this.bubbles[i].$markup.find(".cancel, .send").off("click");
      this.bubbles[i].$markup.remove();
    }
    this.bubbles = [];

    // Get new data
    this.data.fetch();
  }

}; // Bubbles
