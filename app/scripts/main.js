console.log('              ..\n' +
            '            o===.\n' +
            '           o=====.\n' +
            '    .======o=========.                                  ...\n' +
            '    ==================.    ..oo.   .oo   ooooo..ooooo  .ooo.  ooooo.  ooooo\n' +
            '    ==================.   oo   .   =ooo  =o  oo  .=   o.  .oo oo   oo =. .=.\n' +
            '    .o================    oo      o=.o=. =oo=o   .=   =... .= oo   oo =o..oo\n' +
            '      .o=======o..==o      .oooo..o.  .o o. .o.  .o    oooo.  ooooo.  ooooo.\n' +
            '        .====o.o.oo.\n' +
            '          o=o             ........ .. ... ..   .    .... . ..   ..\n' +
            '          .o.                      .\n' +
            '          .o.\n\n');

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
} else {
  document.location = "/oldbrowsers.html";
}
