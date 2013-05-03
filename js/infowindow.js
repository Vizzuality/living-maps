var SentenceList = {
  options: {
    user: 'pulsemaps',
    table: 'infowindows'
  },

  url: function() {
    return 'http://' + this.options.user + '.cartodb.com//api/v2/sql';
  },

  fetch: function() {
    self = this;

    this.base_url = this.url();

    $.getJSON(this.base_url + "?q=" + "SELECT * FROM " + this.options.table, function(data) {
        self.render(data);
    });
  },

  render: function(data) {
    var markup = '<div class="bubble type_' + data.rows[0].type + '"><p>' + data.rows[0].sentence + '</p><a href="#" class="go"></a></div>';

    $('body').append(markup);
  },

  getForTime: function(call) {

  }
}
