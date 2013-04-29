
var App = {

  initialize: function() {
    this.map = new Map('map', {
      zoomControl: false,
      scrollWheelZoom: false,
      center: [40.437944725164726, -3.6795366500000455],
      zoom: 11,
      base_layer: 'https://saleiva.cartodb.com/tiles/here_osm_madrid/{z}/{x}/{y}.png'
    });

    this.carrousel = new Carrousel(
      $('.cities_nav')
    );
  }

};

