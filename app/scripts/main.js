// var _download_bounds = {};
// var _download_tiles = "";

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
    load: [
      'scripts/data/cities.js',
      'scripts/util.js',
      'scripts/vendor/dat.gui.min.js',
      'scripts/vendor/jquery-ui-1.10.2.custom.js',
      'scripts/vendor/jquery.airport-1.1.js',
      'scripts/vendor/jquery.qtip.js',
      'scripts/vendor/leaflet.js',
      'scripts/vendor/spin.js',
      'scripts/vendor/underscore.js',
      'scripts/vendor/zclip.js',
      'scripts/profiler.js',
      'scripts/events.js',
      'scripts/leaflet_tileloader_mixin.js',
      'scripts/canvas_layer.js',
      'scripts/sprites.js',
      'scripts/graph.js',
      'scripts/navigation.js',
      'scripts/slider.js',
      'scripts/mamufas.js',
      'scripts/time_based_data.js',
      'scripts/map/bubbles.js',
      'scripts/map/facts.js',
      'scripts/map/pois.js',
      'scripts/map/share.js',
      'scripts/map/zoom.js',
      'scripts/map.js',
      'scripts/app.js',
      'scripts/probs_density_layer.js'
    ],
    // load: ['scripts/data/cities.min.js', 'scripts/util.min.js', 'scripts/living-cities.min.js', 'scripts/probs_density_layer.min.js'],
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
