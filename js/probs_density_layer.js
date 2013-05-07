
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
    table: "r_even", //"direction_test_5mina", //"r_even",
    column: "mm",
    countby: "sqrt(avg(ac))",
    resolution: 1,
    step: 1,
    start_date: 1, //'2013-03-22 00:00:00+00:00',
    end_date: 1419//'2013-03-22 23:59:57+00:00'
  },

  initialize: function() {
    L.CanvasLayer.prototype.initialize.call(this);
    var tiles_loaded = {};
    this.on('tileAdded', function(t) {
      var k = [t.x, t.y, t.zoom].join(':')
      if(tiles_loaded[k]) {
        return;
      }
      tiles_loaded[k] = true;
      this.getProbsData(t, t.zoom);
    }, this);
    this.options.steps = this.options.end_date - this.options.start_date
    this.MAX_UNITS = (this.options.steps + 2) | 0;
    this.force_map = {};
    this.time = 0;
    this.sprites = []
    this.render_options = {
      part_min_size: 5,
      part_inc: 29,
      part_color: [255, 255, 255, 1.0],
      min_alpha: 0.22,
      alpha_inc: 0.5,
      exp_decay: 13,
      post_process: false,
      post_size: 512,
      post_alpha: 0.15,
      post_decay: 0.07,
      filtered: true,
      part_type: 'glow'
    }
    this.precache_sprites = this.precache_sprites.bind(this)
    this.init_post_process = this.init_post_process.bind(this);

    this.precache_sprites();
  },

  _onMapMove: function() {
    var self = this;
    requestAnimationFrame(function() {
      self._renderSteets();
      self._render();
    });
  },

  _renderSteets: function() {
    var origin = this._map._getNewTopLeftPoint(this._map.getCenter(), this._map.getZoom());
    var c = this._streetsLayer;
    this._streetsLayer.width = this._streetsLayer.width;
    this._streetsLayerCtx.fillStyle = 'rgba(23, 162, 206, 1)';
    this._streetsLayerCtx.fillRect(0, 0, c.width, c.height);
    this._streetsLayerCtx.translate(-origin.x, -origin.y);
    for(var tile in this._tiles) {
      var tt = this._tiles[tile]
      var pos = this._getTilePos(tt.coord);
      this._streetsLayerCtx.drawImage(tt.img, pos.x, pos.y);

    }
  },


  precache_sprites: function() {
    this.sprites = []
    var ro = this.render_options;
    var sprite_size = function(size, alpha) {
     size = size >> 0;
     return Sprites.render_to_canvas(function(ctx, w, h) {
        var c = ro.part_color;
        if(ro.part_type == 'sphere') {
          Sprites.circle(ctx, size, [c[0], c[1], c[2], alpha*255])
        } else {
          Sprites.draw_circle_glow_iso(ctx, size, [c[0], c[1], c[2], alpha*255], ro.exp_decay)
        }
        //Sprites.circle(ctx, size, [c[0], c[1], c[2], alpha*255])
        //Sprites.circle(ctx, size, 'rgba(255, 255, 255, 0.4)')
      }, size, size);
    }
    for(var i = 0; i < 7; ++i) {
      this.sprites.push(sprite_size(ro.part_min_size + i*ro.part_inc, ro.min_alpha + ro.alpha_inc*i));
    }
  },

  set_time: function(t) {
    this.time = (t/60.0) >> 0;
  },

  onAdd: function (map) {
    map.on('move', this._onMapMove, this);
    L.CanvasLayer.prototype.onAdd.call(this, map);
    var origin = this._map._getNewTopLeftPoint(this._map.getCenter(), this._map.getZoom());
    this.init_post_process();
    this._ctx.translate(-origin.x, -origin.y);
    this._backCtx.translate(-origin.x, -origin.y);
    this._streetsLayerCtx.translate(-origin.x, -origin.y);
  },

  init_post_process: function() {
    var canvasPost = document.createElement('canvas');
    var ctxPost = canvasPost.getContext('2d');
    canvasPost.height = canvasPost.width = this.render_options.post_size;
    this.canvasPost = canvasPost;
    this.ctxPost = ctxPost;
    this._streetsLayer = this.addCanvasLayer();
    this._streetsLayerCtx = this._streetsLayer.getContext('2d');
    this._streetsLayer.style['z-index'] = 50;
  },

  _do_post_process: function(origin) {
    var post_size = this.render_options.post_size;
    var ctxPost = this.ctxPost;
    var ctx = this._ctx;

    ctxPost.globalAlpha = this.render_options.post_decay;
    ctxPost.drawImage(this._streetsLayer, 0, 0, post_size, post_size);
    ctxPost.drawImage(this._canvas, 0, 0, post_size, post_size);
    ctxPost.globalAlpha = 1.0

    ctx.globalAlpha = this.render_options.post_alpha;
    ctx.globalCompositeOperation = 'source-over'
    ctx.drawImage(this.canvasPost,origin.x, origin.y, this._canvas.width, this._canvas.height);
    ctx.globalCompositeOperation = 'ligthen'
    ctx.globalAlpha = 1;
  },

  _render: function() {
    if(!this._canvas) return;
    this._canvas.width = this._canvas.width;
    var origin = this._map._getNewTopLeftPoint(this._map.getCenter(), this._map.getZoom());
    /*
    this._ctx.setTransform(1, 0, 0, 1, 0, 0);
    this._ctx.fillStyle = 'rgba(23, 162, 206,'  + this.render_options.post_decay + ')';
    this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    */
    this._ctx.translate(-origin.x, -origin.y);
    this._ctx.globalCompositeOperation = 'lighter';

    var ctx = this._ctx;
    var time = this.time;
    var s = 2
    for(var tile in this._tiles) {
      var tt = this._tiles[tile]
      var x = tt.x
      var y = tt.y;
      var count = this.render_options.filtered? tt.count_filtered:tt.count;
      var len = tt.len
      for(var i = 0; i < len; ++i) {
        var base_time = this.MAX_UNITS * i + time
        var c = count[base_time];
        if(c) {
          var sp = this.sprites[c]
          ctx.drawImage(
            sp,
            x[i] - (sp.width>> 1),
            y[i] - (sp.height>>1) + 2*c)
        }
      }
    }

    if(this.render_options.post_process) {
      this._do_post_process(origin);
    }

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
    count = new Uint8Array(rows.length * this.MAX_UNITS);// 256 monthsrr
    count_filtered = new Uint8Array(rows.length * this.MAX_UNITS);// 256 monthsrr

    // base tile x, y
    var total_pixels = 256 << zoom;
    var max_val = 0;

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

        count_filtered[base_idx + row.dates[j]] =   
        count[base_idx + row.dates[j]] = Math.min(6, Math.ceil(row.vals[j]/10)) >> 0 ;
      }

      var passes = 2;
      while(passes--) {
        for (var j = 1; j < this.MAX_UNITS; ++j) {
          count_filtered[base_idx + j] += count_filtered[base_idx + j - 1]/2.0
        }
      }
      for (var j = 1; j < this.MAX_UNITS; ++j) {
        count_filtered[base_idx + j] = Math.min(6, count_filtered[base_idx + j]) >> 0 ;
      }
    }

    //this.force_keys = Object.keys(this.force_map);

    return {
      count: count,
      count_filtered: count_filtered,
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


    var tiles_url = 'http://0.tiles.cartocdn.com/pulsemaps/tiles/rds_s/{0}/{1}/{2}.png?cache_policy=persist&cache_buster=1'
    var img = new Image();
    img.src = tiles_url.format(zoom, coord.x, coord.y);
    img.onload = function() {
      var pos = self._getTilePos(coord);
      self._streetsLayerCtx.drawImage(img, pos.x, pos.y);
    }

    this.tile(sql, function (data) {
      var time_data = self.pre_cache_data(data.rows, coord, zoom);
      time_data.coord = coord;
      time_data.img = img;
      self._tileLoaded(coord, time_data);
    });
  },

  _onTilesStartLoading: function() {
    Events.trigger('loading');
  },

  _onTilesFinishLoading: function() {
    Events.trigger('finish_loading');
  }


});

