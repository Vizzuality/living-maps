
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
    user: "pulsemaps",
    table: "txtor",
    column: "mm",
    countby: "sqrt(avg(ac))",
    resolution: 1,
    step: 1,
    steps: 720,
    start_date: 445, //'2013-03-22 00:00:00+00:00',
    end_date: 1419 //'2013-03-22 23:59:57+00:00'
  },

  initialize: function() {
    L.CanvasLayer.prototype.initialize.call(this);
    this.on('tileAdded', function(t) {
      this.getProbsData(t, t.zoom);
    }, this);
    this.entities = new Entities(1);
    this.MAX_UNITS = this.options.steps + 2;
    this.force_map = {};
    this.time = 0;
    this.force_keys = null;
    var self = this;
  },

  set_time: function(t) {
    this.time = t;
  },


  onAdd: function (map) {
    L.CanvasLayer.prototype.onAdd.call(this, map);
    var origin = this._map._getNewTopLeftPoint(this._map.getCenter(), this._map.getZoom());
    this._ctx.translate(-origin.x, -origin.y);
    this._backCtx.translate(-origin.x, -origin.y);
  },

  _render: function(delta) {
    this._canvas.width = this._canvas.width;
    var origin = this._map._getNewTopLeftPoint(this._map.getCenter(), this._map.getZoom());
    this._ctx.translate(-origin.x, -origin.y);
    //this._ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    //this._ctx.fillRect(origin.x, origin.y, this._canvas.width, this._canvas.height);
    //this._ctx.fillStyle =  'rgba(0, 0, 0, 0.2)';//'rgba(255, 255,255, 0.3)';
    //this._ctx.fillRect(origin.x, origin.y, this._canvas.width, this._canvas.height);
    this._ctx.strokeStyle= 'rgba(200, 35, 0, 0.8)';
    this._ctx.globalCompositeOperation = 'lighter';
    //this.entities.update(delta)
    //this.entities.render(this._ctx);

    var ctx = this._ctx;
    var time = this.time;
    var s = 2
    for(var tile in this._tiles) {
      var tt = this._tiles[tile]
      var x = tt.x
      var y = tt.y;
      var count = tt.count;
      var len = tt.len
      for(var i = 0; i < len; ++i) {
        var base_time = this.MAX_UNITS * i + time
        var c = count[base_time];
        if(c){
          ctx.drawImage(
            this.entities.sprites[0][0],
            x[i],
            y[i])
        }
        /*
        c = count[base_time - 1];
        if(c){
          ctx.drawImage(
            this.entities.sprites[0][0],
            (x[i] - s*2)>>0,
            (y[i] - s*2)>>0);
        }
        */
      }
    }

/*
    var O_KE_ASE = 200;
    while(O_KE_ASE && this.force_keys) {
      var k = this.force_keys[(Math.random()*this.force_keys.length)>>0];
      var part = this.force_map[k]
      var dx = part.dx[part.index + this.time];
      var dy = part.dy[part.index + this.time];
      if(dx !== 0 && dy !== 0) {
        this.entities.add(
          part.x,
          part.y, 
          part.speeds[part.index + this.time]/20,
          0
        );
        this._backCtx.fillRect(part.x + Math.random(), part.y + Math.random(), 2, 2);
        O_KE_ASE--;
      }
    }

    //this._backCtx.fillRect(origin.x, origin.y, 300, 300);
    this._backCtx.globalCompositeOperation = 'lighter';
    this._backCtx.fillStyle = 'rgba(255, 255, 0, 0.1)';
    */
      /*
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
      */
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

    x = new Int32Array(rows.length);
    y = new Int32Array(rows.length);
    speeds = new Uint8Array(rows.length * this.MAX_UNITS);// 256 months
    count = new Uint32Array(rows.length * this.MAX_UNITS);// 256 monthsrr

    // base tile x, y
    var total_pixels = 256 << zoom;

    for (var i in rows) {
      row = rows[i];
      pixels = meterToPixels(row.x, row.y, zoom); 
      key = '' + (pixels[0] >> 0) + "_" + ((total_pixels - pixels[1])>>0)
      x[i] = pixels[0] >> 0;
      y[i] = (total_pixels - pixels[1])>>0;
      var base_idx = i * this.MAX_UNITS;
      //def[row.sd[0]] = row.se[0];
      for (var j = 0; j < row.dates.length; ++j) {
        //var dir = row.heads[j] + 90;
        //var s = row.speeds[j]
        //dx[base_idx + row.dates[j]] = Math.cos(dir*Math.PI/180);
        //dy[base_idx + row.dates[j]] = Math.sin(dir*Math.PI/180);
        //speeds[base_idx + row.dates[j]] = row.speeds[j];
        count[base_idx + row.dates[j]] = row.vals[j];
      }
      /*
      for (var j = 1; j < this.MAX_UNITS; ++j) {
        count[base_idx + j] += count[base_idx + j - 1]/2.0
      }
      */
    }

    //this.force_keys = Object.keys(this.force_map);

    return {
      count: count,
      x: x,
      y: y,
      len: rows.length
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
    sql = "WITH hgrid AS ( " +
    "    SELECT CDB_RectangleGrid( " +
    "       CDB_XYZ_Extent({0}, {1}, {2}), ".format(coord.x, coord.y, zoom) +
    "       CDB_XYZ_Resolution({0}) * {1}, ".format(zoom, this.options.resolution) +
    "       CDB_XYZ_Resolution({0}) * {1} ".format(zoom, this.options.resolution) +
    "    ) as cell " +
    " ) " +
    " SELECT  " +
    "    x, y, array_agg(c) vals, array_agg(d) dates " +
    " FROM ( " +
    "    SELECT " +
    "      round(CAST (st_xmax(hgrid.cell) AS numeric),4) x, round(CAST (st_ymax(hgrid.cell) AS numeric),4) y, " +
    "      {0} c, floor(({1}- {2})/{3}) d ".format(this.options.countby, this.options.column, this.options.start_date, this.options.step) +
    "    FROM " +
    "        hgrid, {0} i ".format(this.options.table) +
    "    WHERE " +
    "        i.the_geom_webmercator && CDB_XYZ_Extent({0}, {1}, {2}) ".format(coord.x, coord.y, zoom) +
    "        AND ac > 6 AND ST_Intersects(i.the_geom_webmercator, hgrid.cell) " +
    "    GROUP BY " +
    "        hgrid.cell, floor(({0} - {1})/{2})".format(this.options.column, this.options.start_date, this.options.step) +
    " ) f GROUP BY x, y";

    this.tile(sql, function (data) {
      var time_data = self.pre_cache_data(data.rows, coord, zoom);
      self._tileLoaded(coord, time_data);
    });
  }

});

