
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

function get(url, callback) {
  var req = new XMLHttpRequest();

  req.onreadystatechange = function() {
    if (req.readyState == 4){
      if (req.status == 200){
        callback(req);
      } else {
        callback(null);
      }
    }
  };

  if(location.search.indexOf('debug') != -1) {
    req.open("GET", url, true);
  } else {
    req.open("GET", url, true);
    // req.open("GET", "data/bin/"+md5(url)+".bin", true);
  }

  req.responseType = 'arraybuffer';
  req.send(null)
  return req;
}


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
      history.pushState(window.AppData.CITIES[city], null, "#cities/" + city);

      return window.AppData.CITIES[city];
    } else {
      if(isNaN(time) || time < window.AppData.init_time || time >= window.AppData.last_time) {
        time = 0;
      }

      if(parseInt(time, 10) === 0) {
        history.pushState(null, null, "#cities/" + city + "/" + lat + "/" + lon + "/" + zoom + "/");
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
    history.pushState(window.AppData.CITIES[city], null, "#cities/" + window.AppData.CITIES[city].city);

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

  var hash = "#cities/" + city + "/" + lat + "/" + lng + "/" + _zoom + "/";

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
    var speed  = (opt && opt.speed)  || 400;
    var delay  = (opt && opt.delay)  || 100;
    var margin = (opt && opt.margin) || 0;

    $('html, body').delay(delay).animate({scrollTop:$el.offset().top - margin}, speed);
    callback && callback();
  }
}

/*
 * Return URL or md5 file
 */

function getNokiaJSON(url) {
  var _data = null;

  if(location.search.indexOf('debug') != -1) {
    $.getJSON(url, function(data) {
      _data = data.rows;
    });
  } else {
    $.getJSON("js/data/" + md5(url) + ".json", function(data){
      _data = data.rows;
    });
  }

  return _data;
}


/*
 * Generate md5 of a string
 */

function md5cycle(x, k) {
var a = x[0], b = x[1], c = x[2], d = x[3];

a = ff(a, b, c, d, k[0], 7, -680876936);
d = ff(d, a, b, c, k[1], 12, -389564586);
c = ff(c, d, a, b, k[2], 17,  606105819);
b = ff(b, c, d, a, k[3], 22, -1044525330);
a = ff(a, b, c, d, k[4], 7, -176418897);
d = ff(d, a, b, c, k[5], 12,  1200080426);
c = ff(c, d, a, b, k[6], 17, -1473231341);
b = ff(b, c, d, a, k[7], 22, -45705983);
a = ff(a, b, c, d, k[8], 7,  1770035416);
d = ff(d, a, b, c, k[9], 12, -1958414417);
c = ff(c, d, a, b, k[10], 17, -42063);
b = ff(b, c, d, a, k[11], 22, -1990404162);
a = ff(a, b, c, d, k[12], 7,  1804603682);
d = ff(d, a, b, c, k[13], 12, -40341101);
c = ff(c, d, a, b, k[14], 17, -1502002290);
b = ff(b, c, d, a, k[15], 22,  1236535329);

a = gg(a, b, c, d, k[1], 5, -165796510);
d = gg(d, a, b, c, k[6], 9, -1069501632);
c = gg(c, d, a, b, k[11], 14,  643717713);
b = gg(b, c, d, a, k[0], 20, -373897302);
a = gg(a, b, c, d, k[5], 5, -701558691);
d = gg(d, a, b, c, k[10], 9,  38016083);
c = gg(c, d, a, b, k[15], 14, -660478335);
b = gg(b, c, d, a, k[4], 20, -405537848);
a = gg(a, b, c, d, k[9], 5,  568446438);
d = gg(d, a, b, c, k[14], 9, -1019803690);
c = gg(c, d, a, b, k[3], 14, -187363961);
b = gg(b, c, d, a, k[8], 20,  1163531501);
a = gg(a, b, c, d, k[13], 5, -1444681467);
d = gg(d, a, b, c, k[2], 9, -51403784);
c = gg(c, d, a, b, k[7], 14,  1735328473);
b = gg(b, c, d, a, k[12], 20, -1926607734);

a = hh(a, b, c, d, k[5], 4, -378558);
d = hh(d, a, b, c, k[8], 11, -2022574463);
c = hh(c, d, a, b, k[11], 16,  1839030562);
b = hh(b, c, d, a, k[14], 23, -35309556);
a = hh(a, b, c, d, k[1], 4, -1530992060);
d = hh(d, a, b, c, k[4], 11,  1272893353);
c = hh(c, d, a, b, k[7], 16, -155497632);
b = hh(b, c, d, a, k[10], 23, -1094730640);
a = hh(a, b, c, d, k[13], 4,  681279174);
d = hh(d, a, b, c, k[0], 11, -358537222);
c = hh(c, d, a, b, k[3], 16, -722521979);
b = hh(b, c, d, a, k[6], 23,  76029189);
a = hh(a, b, c, d, k[9], 4, -640364487);
d = hh(d, a, b, c, k[12], 11, -421815835);
c = hh(c, d, a, b, k[15], 16,  530742520);
b = hh(b, c, d, a, k[2], 23, -995338651);

a = ii(a, b, c, d, k[0], 6, -198630844);
d = ii(d, a, b, c, k[7], 10,  1126891415);
c = ii(c, d, a, b, k[14], 15, -1416354905);
b = ii(b, c, d, a, k[5], 21, -57434055);
a = ii(a, b, c, d, k[12], 6,  1700485571);
d = ii(d, a, b, c, k[3], 10, -1894986606);
c = ii(c, d, a, b, k[10], 15, -1051523);
b = ii(b, c, d, a, k[1], 21, -2054922799);
a = ii(a, b, c, d, k[8], 6,  1873313359);
d = ii(d, a, b, c, k[15], 10, -30611744);
c = ii(c, d, a, b, k[6], 15, -1560198380);
b = ii(b, c, d, a, k[13], 21,  1309151649);
a = ii(a, b, c, d, k[4], 6, -145523070);
d = ii(d, a, b, c, k[11], 10, -1120210379);
c = ii(c, d, a, b, k[2], 15,  718787259);
b = ii(b, c, d, a, k[9], 21, -343485551);

x[0] = add32(a, x[0]);
x[1] = add32(b, x[1]);
x[2] = add32(c, x[2]);
x[3] = add32(d, x[3]);

}

function cmn(q, a, b, x, s, t) {
a = add32(add32(a, q), add32(x, t));
return add32((a << s) | (a >>> (32 - s)), b);
}

function ff(a, b, c, d, x, s, t) {
return cmn((b & c) | ((~b) & d), a, b, x, s, t);
}

function gg(a, b, c, d, x, s, t) {
return cmn((b & d) | (c & (~d)), a, b, x, s, t);
}

function hh(a, b, c, d, x, s, t) {
return cmn(b ^ c ^ d, a, b, x, s, t);
}

function ii(a, b, c, d, x, s, t) {
return cmn(c ^ (b | (~d)), a, b, x, s, t);
}

function md51(s) {
txt = '';
var n = s.length,
state = [1732584193, -271733879, -1732584194, 271733878], i;
for (i=64; i<=s.length; i+=64) {
md5cycle(state, md5blk(s.substring(i-64, i)));
}
s = s.substring(i-64);
var tail = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
for (i=0; i<s.length; i++)
tail[i>>2] |= s.charCodeAt(i) << ((i%4) << 3);
tail[i>>2] |= 0x80 << ((i%4) << 3);
if (i > 55) {
md5cycle(state, tail);
for (i=0; i<16; i++) tail[i] = 0;
}
tail[14] = n*8;
md5cycle(state, tail);
return state;
}

/* there needs to be support for Unicode here,
 * unless we pretend that we can redefine the MD-5
 * algorithm for multi-byte characters (perhaps
 * by adding every four 16-bit characters and
 * shortening the sum to 32 bits). Otherwise
 * I suggest performing MD-5 as if every character
 * was two bytes--e.g., 0040 0025 = @%--but then
 * how will an ordinary MD-5 sum be matched?
 * There is no way to standardize text to something
 * like UTF-8 before transformation; speed cost is
 * utterly prohibitive. The JavaScript standard
 * itself needs to look at this: it should start
 * providing access to strings as preformed UTF-8
 * 8-bit unsigned value arrays.
 */
function md5blk(s) { /* I figured global was faster.   */
var md5blks = [], i; /* Andy King said do it this way. */
for (i=0; i<64; i+=4) {
md5blks[i>>2] = s.charCodeAt(i)
+ (s.charCodeAt(i+1) << 8)
+ (s.charCodeAt(i+2) << 16)
+ (s.charCodeAt(i+3) << 24);
}
return md5blks;
}

var hex_chr = '0123456789abcdef'.split('');

function rhex(n)
{
var s='', j=0;
for(; j<4; j++)
s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
+ hex_chr[(n >> (j * 8)) & 0x0F];
return s;
}

function hex(x) {
for (var i=0; i<x.length; i++)
x[i] = rhex(x[i]);
return x.join('');
}

function md5(s) {
return hex(md51(s));
}

/* this function is much faster,
so if possible we use it. Some IEs
are the only ones I know of that
need the idiotic second function,
generated by an if clause.  */

function add32(a, b) {
return (a + b) & 0xFFFFFFFF;
}

if (md5('hello') != '5d41402abc4b2a76b9719d911017c592') {
function add32(x, y) {
var lsw = (x & 0xFFFF) + (y & 0xFFFF),
msw = (x >> 16) + (y >> 16) + (lsw >> 16);
return (msw << 16) | (lsw & 0xFFFF);
}
}

function saveContent(fileContents, fileName, fileExtension) {
  var link = document.createElement('a');
  link.download = fileName;
  link.href = 'data:application/'+fileExtension+',' + fileContents;
  link.click();
}

function saveImage(fileContents, fileName) {
  var link = document.createElement('a');
  link.download = fileName;
  link.href = fileContents;
  link.click();
}
