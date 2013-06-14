function Sounds(el, city) {
  var self = this;

  this.city = city;
  this.sounds = [];
  this.howls = {};
  this.isMuted = false;

  this.$el = el;

  self.initialize();
}

Sounds.prototype = {
  initialize: function() {
    var self = this;

    _.each(window.AppData.CITIES, function(city) {
      self.sounds.push(city.city);
    });

    for (var i=0; i<this.sounds.length; i++) {
      this.howls[this.sounds[i]] = new Howl({
        urls: [window.AppData.VIZZUALITYCDN + '/sounds/' + this.sounds[i] + '.mp3'],
        loop: true
      });
    }

    this._initBindings();
  },

  _initBindings: function() {
    Events.on("resumeanimation", this._onResumeAnimation, this);
    Events.on("stopanimation", this._onStopAnimation, this);
    Events.on("stopsounds", this._onStopSounds, this);
    Events.on("changevol", this._onChangeVol, this);

    this.$el.find('a.toggleSound').on('click', null, this, this._onToggleSound);
  },

  _onToggleSound: function(e) {
    var self = e.data;

    e.preventDefault();

    if(self.isMuted) {
      self.isMuted = false;
      self.howls[city].unmute();

      $(this).removeClass("muted");
    } else {
      self.isMuted = true;
      self.howls[city].mute();

      $(this).addClass("muted");
    }
  },

  _onResumeAnimation: function() {
    this.howls[this.city].play();
  },

  _onStopAnimation: function() {
    this.howls[this.city].pause();
  },

  _onStopSounds: function(city) {
    this.howls[city].stop();
  },

  _onChangeVol: function(vol) {
    if(!this.isMuted) {
      this.howls[city].volume(vol);
    }
  },

  set_city: function(city) {
    this.city = city;
  }
}