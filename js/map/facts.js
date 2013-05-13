
  /*
   *  Conceptual city facts
   */

  var ContextualFacts = {

    templates: {
      markup: "<p class='time'><%= description %></p>"
    },

    options: {
      showTime: 300,
      hideTime: 300,
      delayTime: 2000
    },

    el: '#contextualfacts',

    contextualFacts: {},

    initialize: function(map, city) {
      if (!map) throw "you should set map";
      this.map = map;
      this.city = city;

      this.data.fetch();

      return this;
    },

    data: new TimeBasedData({
      user: 'pulsemaps',
      table: 'contextualfacts',
      time_column: 'time',
      city: this.city,
      columns: ['cartodb_id as id', 'time', 'city', 'description']
    }),

    render: function() {},

    _emit: function(data) {
      var self = this;
      var $markup;

      if (!this.contextualFacts[data.id]) {
        var el = _.template(this.templates.markup)(data);
        var $markup = $(el);
        this.contextualFacts[data.id] = {
          $markup: $markup
        };
        $(this.el).append($markup);
      }

      // Get markup if not was defined
      if (!$markup)
        $markup = this.contextualFacts[data.id].$markup;

      // Animation
      $markup.css({
        marginTop: '30px',
        display: 'block',
        opacity: 0
      }).animate({
        marginTop:0,
        opacity: 1
      }, this.options.showTime, function() {
        $(this).delay(self.options.delayTime).animate({
          marginTop: '-30px',
          opacity: 0
        }, self.options.hideTime)
      });
    },

    set_time: function(time) {
      var e = this.data.getFortime((time/60.0)>>0);
      if(e) {
        this._emit(e);
      }
    },

    set_city: function(city) {
      // Set new city
      this.city = city;
      this.data.options.city = city;

      // Clean markups
      this.clean();

      // Get new data
      this.data.fetch();
    },

    clean: function() {
      for (var i in this.contextualFacts) {
        this.contextualFacts[i].$markup.remove();
      }
      this.contextualFacts = [];
    }
  };