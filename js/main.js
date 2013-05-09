$(document).ready(function() {
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ) {
    document.location = "/mobile.html";
  }

  var url = location.href.split("/").pop();

  if(url.length === 0) {
    App.initialize(window.AppData.CITIES['london']);
  } else {
    App.initialize(window.AppData.CITIES[url]);
  }
});
