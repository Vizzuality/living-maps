

var App = {

  initialize: function() {
    this.map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
      attribution: 'Stamen'
    }).addTo(this.map);
  }

}
