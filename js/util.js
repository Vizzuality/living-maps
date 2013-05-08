
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
    this.proj = function (perspective) {
        return new vec3(
          this.x * ( perspective/ ( perspective + this.z ) ),
          this.y * ( perspective/ ( perspective + this.z ) ),
          1
        );
    }
}


