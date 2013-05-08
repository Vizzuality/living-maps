$(document).ready(function() {
  App.initialize({
    time_scale: 15 * 60,
    scale: 2.0,
    map: {
      name: "here_osm_madrid",
      zoom: 12,
      center: [51.511214, -0.100824] // london
    }
  });

  // $(window).resize(function() {
  //   w =  $(this).width();
  //   $(".leaflet-tile-pane").find("canvas").attr("width", w);
  // });
});
