var ContextualFacts = {

  contextualFacts: {},

  initialize: function(map, city) {
    if(!map) throw "you should set map";
    this.map = map;

    this.slider = $("#slider");
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
      var $markup = $('<p class="time">' + data.description + '</p>');
      this.contextualFacts[data.id] = {
        $markup: $markup
      };
      $('#contextualfacts').append($markup);
    }

    $markup = this.contextualFacts[data.id].$markup;

    $markup.css({
      marginTop: '30px',
      display: 'block',
      opacity: 0
    });

    $markup.animate({
      marginTop:0,
      opacity: 1
    }, 300, function() {
      $(this).delay(2000).animate({
        marginTop: '-30px',
        opacity: 0
      }, {
        duration: 300
      })
    });
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
    for (var i in this.contextualFacts) {
      this.contextualFacts[i].$markup.remove();
    }
    this.contextualFacts = [];

    // Get new data
    this.data.fetch();
  }

}; // Contextual Facts