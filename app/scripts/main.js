var city = 'london',
  dragged = false,
  clicked = false,
  stopped = true,
  valueStart = 0,
  isSlowBrowser = false,
  isOldBrowser = false,
  isWebWorkers = true,
  isDebug = false;

if(!Modernizr.webworkers) {
  isWebWorkers = false;
}

if(checkSlowBrowser()) {
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
  document.location = "404.html";
}
