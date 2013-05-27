
if(typeof(window) != 'undefined') {
  var _requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.requestAnimationFrame;

  window.requestAnimationFrame = _requestAnimationFrame;
}
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

function fmod(a, b) {
  var i = Math.floor(a/b);
  return a - i*b;
}

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


/*
 * Transform 2d pixel pos of a css3d transformed div
 */

function transform3d(pos, w, h) {
  var v = new vec3(pos.x,  pos.y, 0);
  v = v
    .translate([-w/2.0, -h/2.0, -50.0])
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

  if(isACity(args[1])) {
    city = args[1]; // city is a global variable

    var lat = parseFloat(args[2]).toFixed(3),
        lon = parseFloat(args[3]).toFixed(3),
        zoom = parseInt(args[4], 10),
        time = args[5];

    if(isNaN(lat) || isNaN(lon) || isNaN(zoom) || zoom < window.AppData.CITIES[city]['map']['minZoom'] || zoom > window.AppData.CITIES[city]['map']['maxZoom']) {
      history.pushState(window.AppData.CITIES[city], null, "/#cities/" + city);

      return window.AppData.CITIES[city];
    } else {
      if(isNaN(time) || time < window.AppData.init_time || time >= window.AppData.last_time) {
        time = 0;
      }

      if(parseInt(time, 10) === 0) {
        history.pushState(null, null, "/#cities/" + city + "/" + lat + "/" + lon + "/" + zoom + "/");
      }

      return {
        city: city,
        map: {
          center: [lat, lon],
          zoom: zoom
        },
        time_scale: 15 * 60,
        scale: 2.0,
        time: time,
        time_offset: window.AppData.CITIES[city].time_offset
      };
    }
  } else {
    history.pushState(window.AppData.CITIES[city], null, "/#cities/" + window.AppData.CITIES[city].city);

    return window.AppData.CITIES[city];
  }
}

var originShift = 2 * Math.PI * 6378137 / 2.0;
var initialResolution = 2 * Math.PI * 6378137 / 256.0;
function tilePixelToPixel(tx, ty, tz, px, py) {
  var res = initialResolution / (1 << tz);
  var tileRes = res * 256;
  var mx = - originShift + tx * tileRes + px * res; // meters
  var my = originShift - ty * tileRes - (256 - py) * res; // meters
  var x = ((mx + originShift) / res) << 0;
  var y = ((my + originShift) / res) << 0;
  return [x, y];
}

function updateHash(map, city, time, zoom) {
  var _zoom = "";

  if(typeof zoom != "undefined") {
    _zoom = zoom;
  } else {
    _zoom = map.getZoom();
  }

  var _time = parseInt(time/60, 10);

  var lat = map.getCenter().lat.toFixed(3);
  var lng = map.getCenter().lng.toFixed(3);

  var hash = "/#cities/" + city + "/" + lat + "/" + lng + "/" + _zoom + "/";

  if(_time != window.AppData.init_time && _time != window.AppData.last_time) {
    hash = hash + _time;
  }

  history.pushState({
    city: city,
    map: {
      center: [lat, lng],
      zoom: _zoom
    },
    city_name: window.AppData.CITIES[city]['city_name'],
    city_title: window.AppData.CITIES[city]['city_title'],
    city_subtitle: window.AppData.CITIES[city]['city_subtitle'],
    time_scale: 15 * 60,
    scale: 2.0,
    time: time
  }, null, hash);
}

/*
 * Moves the scroll to the position of $el
 */

function goTo($el, opt, callback) {
  if ($el) {
    var speed  = (opt && opt.speed)  || 800;
    var delay  = (opt && opt.delay)  || 100;
    var margin = (opt && opt.margin) || 0;

    $('html, body').delay(delay).animate({scrollTop:$el.offset().top - margin}, speed);
    callback && callback();
  }
}
