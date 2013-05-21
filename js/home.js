var Home = {
  initialize: function() {
    this.$about = $("#about");
    this.$about_link = $(".about_link");
    this.$contest = $("#contest");
    this.$contest_link = $(".contest_link");
    this.$map_container = $("section.map");
    this.$nav = $("#top_nav");
    this.$logo = $("#logo");
    this.$map = $(".map");

    this._initBindings();
  },

  _initBindings: function() {
    var self = this;

    $(window)
      .on("scroll", function() {
        self._checkResize();
      })
      .on("resize", function() {
        self._checkResize();
      })

    this.$about_link.on("click", function(event) {
      Events.trigger("disablemamufas");

      self.goto(event, self.$about);
    });

    this.$contest_link.on("click", function(event) {
      Events.trigger("disablemamufas");

      self.goto(event, self.$contest);
    });

    this.$logo.on("click", function(event) {
      self.goto(event, self.$map);

      Events.trigger("disablemamufas");
    });

    Events.on("enablemamufas", function() {
      self.goto(event, self.$map);
    });
  },

  _checkResize: function() {
    if (this.resize) clearTimeout(this.resize);

    this.resize = setTimeout(this._positionScroll(), 100);
  },

  _positionScroll: function() {
    var self = this;

    if($(window).scrollTop() >= this.$map_container.height()) {
      this.$nav.animate({top: "0"}, {
        duration: 250,
        queue: false,
        easing: 'linear'
      });
    } else {
      this.$nav.animate({top: "-72px"}, {
        duration: 250,
        queue: false,
        easing: 'linear',
        complete: function() {
          Events.trigger("scrolledup");
        }
      });
    }
  },

  goto: function(e, el) {
    e.preventDefault();

    goTo(el);
  }
}