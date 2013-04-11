
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.requestAnimationFrame;

var originShift = 2 * Math.PI * 6378137 / 2.0;
var initialResolution = 2 * Math.PI * 6378137 / 256.0;
function meterToPixels(mx, my, zoom) {
    var res = initialResolution / (1 << zoom);
    var px = (mx + originShift) / res;
    var py = (my + originShift) / res;
    return [px, py];
}

var StreetLayer = L.CanvasLayer.extend({

  options: {
    user: 'pulsemaps',
    table: 'probes_20130323_nyc',
    column: 'datetime',
    resolution: 3,
    step: 250,
    countby: 'count(i.cartodb_id)',
    start_date: '2013-03-23 00:00:00+00:00',
    end_date: '2013-03-23 23:59:57+00:00'
  },

  initialize: function() {
    L.CanvasLayer.prototype.initialize.call(this);
    this.on('tileAdded', function(t) {
      this.getProbsData(t, t.zoom);
    }, this);
    this.entities = new Entities(13000);
    this.MAX_UNITS = this.options.step;
    this.force_map = {};
    this.time = 0;
    this.force_keys = null;
    var self = this;
  },

  set_time: function(t) {
    this.time = t;
  },

  getStreetData: function() {
    $.getJSON("oneday_london_14_96_count.json", function(data) {
    });
  },

  onAdd: function (map) {
    L.CanvasLayer.prototype.onAdd.call(this, map);
    var origin = this._map._getNewTopLeftPoint(this._map.getCenter(), this._map.getZoom());
    this._ctx.translate(-origin.x, -origin.y);
  },

  _render: function(delta) {
    this._canvas.width = this._canvas.width;
    var origin = this._map._getNewTopLeftPoint(this._map.getCenter(), this._map.getZoom());
    this._ctx.translate(-origin.x, -origin.y);
    //this._ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    //this._ctx.fillRect(origin.x, origin.y, this._canvas.width, this._canvas.height);
    this._ctx.fillStyle =  'rgba(200, 35, 0, 0.3)';//'rgba(255, 255,255, 0.3)';
    this._ctx.strokeStyle= 'rgba(200, 35, 0, 0.3)';
    this._ctx.globalCompositeOperation = 'lighter';
    this.entities.update(delta, this.force_map, this.time);
    this.entities.render(this._ctx);

    var ctx = this._ctx;
    ctx.strokeStyle = 'blue';
    ctx.fillStyle = 'red';
    if(0)for(var p in this.force_map) {
      var part = this.force_map[p];
      var dx = part.dx[part.index + this.time];
      var dy = part.dy[part.index + this.time];
      if(dx !== 0 && dy !== 0) {
        //ctx.beginPath();
        //ctx.moveTo(part.x, part.y)
        //ctx.fillRect(part.x, part.y, 2, 2);
        /*ctx.lineTo(
          part.x + dx,
          part.y + dy
        )
        ctx.stroke();
        */
      }
    }

    var O_KE_ASE = 100;
    while(O_KE_ASE && this.force_keys) {
      var k = this.force_keys[(Math.random()*this.force_keys.length)>>0];
      var part = this.force_map[k]
      var dx = part.dx[part.index + this.time];
      var dy = part.dy[part.index + this.time];
      if(dx !== 0 && dy !== 0) {
        var speed = part.speeds[part.index + this.time];
        //var count = part.count[part.index + this.time]
        //count = Math.pow(count, 3);
        if(speed > 1) {
          speed /= 5;
          speed = Math.random() < 0.5 ? -speed: speed;
          speed *= (0.3 + 0.7*Math.random())
            this.entities.add(
              part.x,
              part.y, 
              speed*dx,
              speed*dy,
              3*Math.random()
            );
            O_KE_ASE--;
        }

      }
    }
    /*
    this.entities.add(origin.x + 500, origin.y + 200, 20*(Math.random() - 0.5), 40*(Math.random() - 0.9), 10);
    */

  },

  tile: function(sql, callback) {
    var base_url = 'http://pulsemaps.cartodb.com/'
    $.getJSON(base_url + "api/v2/sql?q=" + encodeURIComponent(sql), function (data) {
      callback(data);
    });
  },

  pre_cache_data: function(rows, coord, zoom) {
    var row;
    var count;
    var xcoords;
    var ycoords;
    var values;
    var key;

    dx = new Float32Array(rows.length * this.MAX_UNITS);// 256 months
    dy = new Float32Array(rows.length * this.MAX_UNITS);// 256 months
    speeds = new Uint8Array(rows.length * this.MAX_UNITS);// 256 months
    count = new Uint32Array(rows.length * this.MAX_UNITS);// 256 monthsrr

    // base tile x, y
    var total_pixels = 256 << zoom;

    for (var i in rows) {
      row = rows[i];
      pixels = meterToPixels(row.x, row.y, zoom); 
      key = '' + (pixels[0] >> 0) + "_" + ((total_pixels - pixels[1])>>0)
      //xcoords[i] = pixels[0] >> 0;
      //ycoords[i] = (total_pixels - pixels[1])>>0;
      var base_idx = i * this.MAX_UNITS;
      //def[row.sd[0]] = row.se[0];
      for (var j = 0; j < row.dates.length; ++j) {
        var dir = row.heads[j] + 90;
        var s = row.speeds[j]
        dx[base_idx + row.dates[j]] = Math.cos(dir*Math.PI/180);
        dy[base_idx + row.dates[j]] = Math.sin(dir*Math.PI/180);
        speeds[base_idx + row.dates[j]] = row.speeds[j];
        count[base_idx + row.dates[j]] = row.count[j];
      }

      this.force_map[key] = {
        index: base_idx,
        x: pixels[0] >> 0, 
        y: (total_pixels - pixels[1])>>0,
        dx: dx,
        dy: dy,
        //heads: heads,
        speeds: speeds,
        count: count
      }
    }

    this.force_keys = Object.keys(this.force_map);

    return {
      /*length: rows.length,
      xcoords: xcoords,
      ycoords: ycoords,
      speeds: speeds,
      heads: heads,
      size: 1 << (this.resolution * 2)
      */
    };
  },

  getProbsData: function(coord, zoom) {
    var self = this;
    var sql = "WITH hgrid AS ( " +
    "    SELECT CDB_RectangleGrid( " +
    "       CDB_XYZ_Extent({0}, {1}, {2}),".format(coord.x, coord.y, zoom) +
    "       CDB_XYZ_Resolution({0}) * {1}, ".format(zoom, self.options.resolution) +
    "       CDB_XYZ_Resolution({0}) * {1} ".format(zoom, self.options.resolution) +
    "    ) as cell " +
    " ) " +
    " SELECT " +
    "    x, y, array_agg(c) count, array_agg(f) speeds, array_agg(g) heads ,array_agg(d) dates " +
    " FROM ( " +
    "    SELECT " +
    "      round(CAST (st_xmax(hgrid.cell) AS numeric),4) x, round(CAST (st_ymax(hgrid.cell) AS numeric),4) y, " +
    "      {0} c, avg(i.speed) f,avg(i.head) g, floor((date_part('epoch', {1})- date_part('epoch','{2}'::timestamp))/{3}) d ".format(self.options.countby, self.options.column, self.options.start_date, self.options.step) +
    "    FROM  " +
    "        hgrid, {0} i ".format(self.options.table) +
    "    WHERE " +
    "        i.{0} > '{1}'::timestamp ".format(self.options.column, self.options.start_date) +
    "        AND i.{0} <  '{1}'::timestamp ".format(self.options.column, self.options.end_date) +
    "        AND head > -10 AND speed > -10 " +
    "        AND ST_Intersects(i.the_geom_webmercator, hgrid.cell)  " +
    "    GROUP BY  " +
    "        hgrid.cell, floor((date_part('epoch',{0}) - date_part('epoch','{1}'::timestamp))/{2})".format(self.options.column, self.options.start_date, self.options.step) +
    " ) f GROUP BY x, y";
    this.tile(sql, function (data) {
      var time_data = self.pre_cache_data(data.rows, coord, zoom);
      self._tileLoaded(coord, time_data);
    });
  }

});


var App = {

  initialize: function() {
    this.map = L.map('map').setView([40.73577336230974, -73.988989828125], 13);
    this.map.keyboard.disable();
    L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
      attribution: 'Stamen'
    })
    .setOpacity(0.3)
    .addTo(this.map);

    this.addStreetLayer();
    this.render = this.render.bind(this);
    this.initControls();
    this.t = 0;
    this.time = document.getElementById('date');
    requestAnimationFrame(this.render);
    var self = this;
    setInterval(function() {
      self.time.innerHTML = self.t++;
    }, 1500)

  },

  render: function() {
    this.layer._render(0.02);
    if(this.controls.left) {
      this.t = Math.max(0, this.t - 1);
      this.layer.set_time(this.t);
      this.time.innerHTML = this.t;
    } else if(this.controls.right) {
      this.t++;
      this.layer.set_time(this.t);
      this.time.innerHTML = this.t;
    }
    requestAnimationFrame(this.render);
  },

  addStreetLayer: function() {
    this.layer = new StreetLayer();
    this.map.addLayer(this.layer);
  },

  initControls: function() {
    var controls = this.controls = {
      left: false,
      right: false,
      fire: false,
      up: false,
      down: false
    };
    window.addEventListener('keyup', function(e) { key(e, false); });
    window.addEventListener('keydown', function(e) { key(e, true);});
    function key(e, w) {
      if(e.keyCode == 38) {      controls.up= w; }
      else if(e.keyCode == 40) { controls.down = w; }
      else if(e.keyCode == 37) { controls.left = w; } 
      else if(e.keyCode == 39) { controls.right= w; } 
      else if(e.keyCode == 32) { controls.fire = w; }
    };
  }

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
