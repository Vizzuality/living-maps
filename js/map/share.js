  
  /*
   *  Share city dialog
   */

  var Share = {

    el: '#backdrop',

    options: {
      bitly: {
        apikey: "ey",
        secret: "ey"
      }
    },

    initialize: function() {
      this.$el = $(this.el);
      this._initBindings();
      return this;
    },

    _initBindings: function() {
      Events.on("openshare", this._onOpenShare, this);
      this.$el.find('.close, .share').on('click', null, this, this._onCloseShare);
    },

    _initKeyBindings: function() {

    },

    _disableKeyBindings: function() {

    },

    _onOpenShare: function(desc) {
      Events.trigger("stopanimation");
      this._setText(desc);
      this._initKeyBindings();
      this.show();
    },

    _onCloseShare: function(e) {
      e.preventDefault();
      var self = e.data;
      this._disableKeyBindings();
      Events.trigger("resumeanimation");
      self.hide();
    },

    _setText: function(text) {
      this.$el.find('textarea').val(this._sanitizeText(text));

      // Disable textarea

      // Get link short

      // Enable textarea
    },

    _sanitizeText: function(text) {
      return text
        .replace(/<strong>/g, '')
        .replace(/<\/strong>/g, '')
        .replace(/<i>/g, '')
        .replace(/<\/i>/g, '')
    },

    hide: function() {
      this.$el.fadeOut();
    },

    show: function() {
      this.$el.fadeIn();
    }

  };