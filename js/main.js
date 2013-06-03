var city = 'london',
	dragged = false,
	clicked = false,
	stopped = true,
	valueStart = 0,
  isSlowBrowser = false,
  isWebWorkers = true;

if(navigator.userAgent.match(/Android/i)
  || navigator.userAgent.match(/webOS/i)
  || navigator.userAgent.match(/iPhone/i)
  || navigator.userAgent.match(/iPad/i)
  || navigator.userAgent.match(/iPod/i)
  || navigator.userAgent.match(/BlackBerry/i)
  || navigator.userAgent.match(/Windows Phone/i)
) {
  document.location = "/mobile.html";
} else{
  if(Modernizr.canvas && Modernizr.history) {
    if(!Modernizr.webworkers) {
      isWebWorkers = false;
    }

    if(checkVersion()) {
      isSlowBrowser = true;
    }
  } else {
    document.location = "/oldbrowsers.html";
  }
}

$(document).ready(function() {
  var hash = location.hash.split("#").pop();

  if(hash.length === 0) {
    App.initialize(window.AppData.CITIES[city]);
  } else if(hash.split("/")[0] === "cities") {
    // be careful, parseHash sets the global variable city
    App.initialize(parseHash(hash));

    Events.trigger("enablemamufas");
  } else {
    document.location = "/404.html";
  }
});
