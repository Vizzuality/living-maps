
var _requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.requestAnimationFrame;

window.requestAnimationFrame = _requestAnimationFrame;
/*
var _render_queue = [];
 *
 * function(fn) {
  if(_render_queue.length == 0) {
    _requestAnimationFrame(function() {
      var f;
      while(f = _render_queue.pop()) {
        f();
      }
    });
  }
  _render_queue.push(fn);
}*/

function rand() {
  return 2.0*(Math.random() - 0.5)
}

function get_debug_param(name, def){
  def = def || 0;
  var t = window.location.href.match(new RegExp(name + '=(\\d+)'))
  return t && t.length == 2 ? 0 | t[1] : def
}

String.prototype.format = (function (i, safe, arg) {
    function format() {
        var str = this,
            len = arguments.length + 1;

        for (i = 0; i < len; arg = arguments[i++]) {
            safe = typeof arg === 'object' ? JSON.stringify(arg) : arg;
            str = str.replace(RegExp('\\{' + (i - 1) + '\\}', 'g'), safe);
        }
        return str;
    }

    //format.native = String.prototype.format;
    return format;
})();

function vec3(xx, yy, zz) {
    this.x = xx || 0;
    this.y = yy || 0;
    this.z = zz || 0;
    this.translate = function (d) { return new vec3(this.x+d[0], this.y+d[1],this.z+d[2]) }
    this.scale = function(s) { return new vec3(s*this.x, s*this.y,s*this.z) }
    this.rotz = function(ang) {
      var c = Math.cos(ang)
      var s = Math.sin(ang)
      return new vec3(this.x*c - this.y*s,this.y*c + this.x*s, this.z)
    }
    this.rotx = function(ang) {
      var c = Math.cos(ang)
      var s = Math.sin(ang)
      return new vec3(this.x,this.y*c - this.z*s, this.z*c + this.y*s);
    }
    this.proj = function (perspective, aspect) {
        return new vec3(
          this.x * ( perspective/ ( perspective - this.z ) ),
          this.y * ( perspective/ ( perspective - this.z ) ),
          1
        );
    }
}


/**
 * transform 2d pixel pos of a css3d transformed div
 */
function transform3d(pos, w, h) {
  var v = new vec3(pos.x,  pos.y, 0);
  v = v
    .translate([-w/2.0, -h/2.0, 0.0])
    .rotx(45*Math.PI/180.0)
    .proj(1000)
    .translate([w/2.0, h/2.0, 0.0])
  return {
    x: v.x,
    y: v.y
  }
}

function latlonTo3DPixel(map, latlon) {
  var pos = map.latLngToContainerPoint(latlon);
  var s = map.getSize()
  return transform3d(pos, s.x, s.y);
}

function isACity(city) {
  var really = false;

  _.each(window.AppData.CITIES, function(object, key) {
    if(city === key) {
      really = true;
    }
  });

  return really;
}

function parseHash(hash) {
  var args = hash.split("/");

  if(isACity(args[0])) {
    city = args[0]; // city is a global variable

    var lat = parseFloat(args[1]).toFixed(3),
        lon = parseFloat(args[2]).toFixed(3),
        zoom = parseInt(args[3], 10),
        time = args[4];

    if(isNaN(lat) || isNaN(lon) || isNaN(zoom) || zoom < window.AppData.CITIES[city]['map']['minZoom'] || zoom > window.AppData.CITIES[city]['map']['maxZoom']) {
      history.pushState(null, null, "#" + city);

      return window.AppData.CITIES[city];
    } else {
      if(isNaN(time)) {
        time = 0;
      }

      return {
        city: city,
        map: {
          center: [lat, lon],
          zoom: zoom
        },
        city_name: window.AppData.CITIES[city]['city_name'],
        city_title: window.AppData.CITIES[city]['city_title'],
        city_subtitle: window.AppData.CITIES[city]['city_subtitle'],
        time_scale: 15 * 60,
        scale: 2.0,
        time: time
      };
    }
  } else {
    history.pushState(null, null, "#" + window.AppData.CITIES[city].city);

    return window.AppData.CITIES[city];
  }
}

function updateHash(map, city, time, zoom) {
  var _zoom = "";

  if(typeof zoom != "undefined") {
    _zoom = zoom;
  } else {
    _zoom = map.getZoom();
  }

  var lat = map.getCenter().lat.toFixed(3);
  var lng = map.getCenter().lng.toFixed(3);

  var hash = "/cities/#" + city + "/" + lat + "/" + lng + "/" + _zoom;

  history.pushState(null, null, hash);
}