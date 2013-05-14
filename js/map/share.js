
  /*
   *  Share city dialog
   */

  var Share = {

    el: '#backdrop',
    _visible: false,

    options: {
      bitly: {
        key: 'R_de188fd61320cb55d359b2fecd3dad4b',
        login: 'vizzuality'
      }
    },

    initialize: function() {
      this.$el = $(this.el);
      this._initBindings();

      return this;
    },

    _initBindings: function() {
      Events.on("openshare", this._onOpenShare, this);
      this.$el.find('.close').on('click', null, this, this._onCloseShare);
      this.$el.find('.share.facebook').on('click', null, this, this._shareOnFacebook);
      this.$el.find('.share.twitter').on('click', null, this, this._shareOnTwitter);
    },

    _initKeyBindings: function() {
      $(document).on('keyup', null, this, this._checkKey);
    },

    _disableKeyBindings: function() {
      $(document).off('keyup', this._checkKey);
    },

    _shareOnTwitter: function(e) {
      var self = e.data;
      var url = window.location.href;
      var text = self.$el.find("textarea").val();
      $(e.target).attr('href', "https://twitter.com/share?url=&text=" + text);
    },

    _shareOnFacebook: function(e) {
      var self = e.data;
      var url = window.location.href;
      var text = self.$el.find("textarea").val();
      $(e.target).attr('href', "http://www.facebook.com/sharer.php?u=" + url + "&text=" + text)
    },

    _checkKey: function(e) {
      var keycode = e.which || e.keyCode;
      if (e) {
        var stop = false;
        var self = e.data;
        
        // ESC?
        if (keycode == 27) {
          self._onCloseShare(e);
        } else {
          self._checkHeight(true);
        }

        if (stop) e.stopPropagation();
      }
    },

    _checkHeight: function(animate) {
      var $textarea = this.$el.find('textarea');

      if(animate) {
        if($textarea.val().length > 90) {
          $textarea.animate({
            height: "290px",
            "min-height": "290px",
            "max-height": "290px"
          });
        }
      } else if($textarea.val().length + 21 > 90) {
        $textarea.css({
          height: "290px",
          "min-height": "290px",
          "max-height": "290px"
        });
      }
    },

    _setText: function(text) {
      var $textarea = this.$el.find('textarea');
      var self = this;
      $textarea.val(this._sanitizeText(text));

      this._checkHeight(false);

      // Disable textarea
      $textarea.attr('disabled','');

      // Get link short
      this._generateShortUrl(window.location.href, function(url) {
        $textarea.val(self._sanitizeText(text + " - " + url));
        // Enable textarea
        $textarea.removeAttr('disabled');
      })
    },

    _generateShortUrl: function(url, callback) {
      $.ajax({
        url:"https://api-ssl.bitly.com/v3/shorten?longUrl=" + encodeURIComponent(url)+ "&login=" + this.options.bitly.login + "&apiKey=" + this.options.bitly.key,
        type:"GET",
        async: false,
        dataType: 'jsonp',
        success: function(r) {
          if (!r.data.url) {
            callback && callback(url);
            throw new Error('BITLY doesn\'t allow localhost alone as domain, use localhost.lan for example');
          } else {
            callback && callback(r.data.url)
          }
        },
        error: function(e) { callback && callback(url) }
      });
    },

    _sanitizeText: function(text) {
      return text
        .replace(/<strong>/g, '')
        .replace(/<\/strong>/g, '')
        .replace(/<i>/g, '')
        .replace(/<\/i>/g, '')
    },

    _disableCopy: function() {
      this.$el.find('a.copy').zclip('remove');
    },

    _enableCopy: function() {
      var self = this;

      // Hello hack
      setTimeout(function(){
        self.$el.find('a.copy').zclip({
          path:'/flash/ZeroClipboard.swf',
          copy: function() {
            return self.$el.find("textarea").val();
          }
        });
      },1000);
    },

    _onOpenShare: function(desc) {
      // this._updateHash(city, time);
      Events.trigger("stopanimation");
      this._setText(desc);
      this._initKeyBindings();
      this._enableCopy();
      this.show();
    },

    _onCloseShare: function(e) {
      e.preventDefault();
      var self = e.data;
      self.hide();
      self._disableCopy();
      self._disableKeyBindings();
      Events.trigger("resumeanimation");
      this.$el.find('textarea').css({
        height: "175px",
        "min-height": "175px",
        "max-height": "175px"
      });
    },

    // _updateHash: function(city, time) {
    //   var _time = new Date(time);
    //   var hours = _time.getHours();
    //   var minutes = _time.getMinutes();

    //   console.log(city, hours, minutes);
    // },

    hide: function() {
      this.$el.fadeOut();
      this._visible = false;
    },

    show: function() {
      this.$el.fadeIn();
      this._visible = true;
    },

    visible: function() {
      return this._visible;
    }
  };