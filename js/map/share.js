  
  /*
   *  Share city dialog
   */

  var Share = {

    el: '#backdrop',

    options: {},

    initialize: function() {
      this.$el = $(this.el);
      this._initBindings();
      return this;
    },

    _initBindings: function() {
      Events.bind("openshare", this._onOpenShare);
      this.$el.find('a.close')
      //Events.bind("closeshare", this.onCloseShare);
    },

    _onOpenShare: function(ev) {
      Events.trigger("stopanimation");
    },

    _onCloseShare: function(ev) {
      Events.trigger("resumeanimation");
    }

  };