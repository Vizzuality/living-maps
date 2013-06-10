if($.browser.mobile) {
  document.location = "/mobile.html";
} else if(Modernizr.canvas && Modernizr.history) {
  var city = 'london',
    dragged = false,
    clicked = false,
    stopped = true,
    valueStart = 0,
    isSlowBrowser = false,
    isWebWorkers = true,
    isDebug = false;

  Modernizr.load({
    // load: ['scripts/data/cities.js', 'scripts/util.js', 'scripts/living-cities.js', 'scripts/probs_density_layer.js'],
    load: ['scripts/data/cities.min.js', 'scripts/util.min.js', 'scripts/living-cities.min.js', 'scripts/probs_density_layer.min.js'],
    complete: function() {
      if(!Modernizr.webworkers) {
        isWebWorkers = false;
      }

      if(checkVersion()) {
        isSlowBrowser = true;
      }

      var hash = location.hash.split("#").pop();

      if(location.hash.indexOf('debug') != -1)
        isDebug = true;

      if(hash.length === 0) {
        App.initialize(window.AppData.CITIES[city]);
      } else if(hash.split("/")[0] === "cities") {
        // be careful, parseHash sets the global variable city
        App.initialize(parseHash(hash));

        Events.trigger("enablemamufas");
      } else {
        document.location = "/404.html";
      }
    }
  });
} else {
  document.location = "/oldbrowsers.html";
}
