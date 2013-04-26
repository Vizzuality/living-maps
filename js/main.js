var map = L.map('map', { zoomControl: false, scrollWheelZoom: false }).setView([40.437944725164726, -3.6795366500000455], 11);


$(document).ready(function() {
  // parallax cities
  $(window).on('mousemove', function(e) {
    var width = $(this).width()/2;
    var xPos = e.pageX - width;
    var mouseXPercent = Math.round(xPos / width * 20);

    var diffX = width - $('.cities_nav').width();
    var myX = diffX * (mouseXPercent / 100);

    $('.cities_nav').animate({'left': myX + 'px'}, {duration: 50, queue: false, easing: 'linear'});
  });

  L.tileLayer('https://saleiva.cartodb.com/tiles/here_osm_madrid/{z}/{x}/{y}.png').addTo(map)
});
