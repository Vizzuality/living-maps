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

  App.initialize({
    time_scale: 15 * 60,
    scale: 2.0,
    map: {
      name: "here_osm_madrid",
      zoom: 12,
      center: [51.511214, -0.100824] // london
    },
    city: "london"
  });
});
