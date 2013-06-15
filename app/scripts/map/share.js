/*
 *  Share dialog
 */

var Share = {

  el: '#share',
  _visible: false,

  options: {
    bitly: {
      key: 'R_de188fd61320cb55d359b2fecd3dad4b',
      login: 'vizzuality'
    }
  },

  initialize: function() {
    this.$el = $(this.el);
    this.$textarea = $("#textarea");
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
    $(document).on('keydown', null, this, this._checkKey);
  },

  _disableKeyBindings: function() {
    $(document).off('keydown', this._checkKey);
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

    if(e) {
      var self = e.data;
      var stop = false;

      // ESC?
      if(keycode == 27) {
        self._onCloseShare(e);
      } else if(keycode == 13) {
        e.preventDefault();
      } else {
        self._checkHeight();
      }

      if(stop) e.stopPropagation();
    }
  },

  _checkHeight: function(animate) {
    if(this.$textarea.height() != 320 && this.$textarea.val().length > 80) {
      this.$textarea.animate({
        height: "320px"
      }, function() {
        $(".zclip").css("top", $("a.copy").position().top);
      });
    }
  },

  _setText: function(text) {
    var self = this;

    this.$textarea.val(this._sanitizeText(text));

    // Disable textarea
    this.$textarea.attr('disabled','');

    // Get link short
    this._generateShortUrl(window.location.href, function(url) {
      self.$textarea.val(self._sanitizeText(text + " - " + url));
      // Enable textarea
      self.$textarea.removeAttr('disabled');
    });

    if(this.$textarea.val().length + 21 > 80) {
      this.$textarea.css({
        height: "320px"
      });
    }
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
        path: "http://" + VIZZUALITYCDN + '/flash/ZeroClipboard.swf',
        copy: function() {
          $(this).text("Copied!");

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
    var self = e.data;

    e.preventDefault();

    self.hide();
    self._disableCopy();
    self._disableKeyBindings();
    Events.trigger("resumeanimation");

    setTimeout(function(){
      self.$textarea.css({
        height: "175px"
      });

       $("a.copy").text("Copy Link");
    }, 1000);
  },

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
