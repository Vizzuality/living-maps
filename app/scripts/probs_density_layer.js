
var originShift = 2 * Math.PI * 6378137 / 2.0;
var initialResolution = 2 * Math.PI * 6378137 / 256.0;
function meterToPixels(mx, my, zoom) {
    var res = initialResolution / (1 << zoom);
    var px = (mx + originShift) / res;
    var py = (my + originShift) / res;
    return [px, py];
}

// @param tx tile x
// @param ty tile y
// @param tz tile zoom
// @param px pixel x ordinate within the tile (0..255 range)
// @param py pixel x ordinate within the tile (0..255 range)
//
// @returns an array where first element is global X and
//          second element is global Y.
//
function tilePixelToPixel(tx, ty, tz, px, py) {
  var res = initialResolution / (1 << tz);
  var tileRes = res * 256;
  var mx = - originShift + tx * tileRes + px * res; // meters
  var my = originShift - ty * tileRes - (256 - py) * res; // meters
  var x = ((mx + originShift) / res) << 0;
  var y = ((my + originShift) / res) << 0;
  return [x, y];
}


var StreetLayer = L.CanvasLayer.extend({

  options: {
    user: "pulsemaps",
    table: "london_2m_1mm", //"all_2m_live_5mm", //"direction_test_5mina", //"r_even",
    column: "mm",
    countby: "sqrt(avg(ac))",
    resolution: 1,
    step: 1,
    decimate: get_debug_param('decimation', 3),
    start_date: 1, //'2013-03-22 00:00:00+00:00',
    end_date: 1419,//'2013-03-22 23:59:57+00:00'
    time_offset: 0,
    use_web_worker: true,
    num_web_workers: 3,
    reduction: 0
  },

  initialize: function(options) {
    _.extend(this.options, options);
    L.CanvasLayer.prototype.initialize.call(this);
    this.on('tileAdded', function(t) {
      this.getProbsData(t, t.zoom);
    }, this);

    this._render = this._render1;
    this.pre_cache_data = this.pre_cache_data1;
    this.options.steps = this.options.end_date - this.options.start_date
    this.MAX_UNITS = (this.options.steps + 2) | 0;
    this.force_map = {};
    this.time = 0;
    this.sprites = []
    this.totalBytes = 0;
    this.render_options = {
      part_min_size: 5,
      part_inc: 29,
      part_color: [255, 255, 255, 1.0],
      min_alpha: 0.22,
      alpha_inc: 0.5,
      exp_decay: 9,
      post_process: false,
      post_size: 512,
      post_alpha: 0.15,
      post_decay: 0.07,
      filtered: false,
      part_type: 'glow'
    }

    if(this.options.use_web_worker) {
      this.workers = [];
      for(var i = 0; i < this.options.num_web_workers; ++i) {
        // this.workers.push(new Worker("scripts/process_tile_worker.js"));
        this.workers.push(new Worker("scripts/process_tile_worker.min.js"));
      }
      this._web_workers_callbacks = {};
    }
    this.precache_sprites = this.precache_sprites.bind(this)
    //this.init_post_process = this.init_post_process.bind(this);

    this.precache_sprites();
  },

  setCity: function(name, time_offset, reduction) {
    //this.options.table = name + "_2m_1mm";
    this.options.table = name + "_live";
    this.options.time_offset = time_offset
    this.options.reduction = reduction;
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
    this._streetsLayerCtx.fillStyle = 'rgba(0, 0, 0, 0)';
    this._streetsLayerCtx.fillRect(0, 0, c.width, c.height);
    this._streetsLayerCtx.translate(-origin.x, -origin.y);
    this._streetsLayerCtx.globalAlpha = 0.75;
    for(var tile in this._tiles) {
      var tt = this._tiles[tile]
      var pos = this._getTilePos(tt.coord);
      this._streetsLayerCtx.drawImage(tt.img, pos.x, pos.y);
    }
  },

  _renderStreetTile: function(coord, img) {
    var origin = this._map._getNewTopLeftPoint(this._map.getCenter(), this._map.getZoom());
    var c = this._streetsLayer;
    this._streetsLayerCtx.translate(-origin.x, -origin.y);
    this._streetsLayerCtx.globalAlpha = 0.75;
    var pos = this._getTilePos(coord);
    this._streetsLayerCtx.drawImage(img, pos.x, pos.y);
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
    t += this.options.time_offset*60;
    t = fmod(t, this.options.end_date*60);
    this.time = (t/60.0) >> 0;
    this.time = (this.time/this.options.decimate) >> 0;
  },

  onAdd: function (map) {
    map.on('move reset', this._onMapMove, this);
    L.CanvasLayer.prototype.onAdd.call(this, map);
    var origin = this._map._getNewTopLeftPoint(this._map.getCenter(), this._map.getZoom());
    //this.init_post_process();
    this._ctx.translate(-origin.x, -origin.y);
    this._ctx.globalCompositeOperation = 'lighter';

    // streets layer
    this._streetsLayer = this.addCanvasLayer();
    this._streetsLayerCtx = this._streetsLayer.getContext('2d');
    this._streetsLayer.style['zIndex'] = 50;
    this._streetsLayerCtx.translate(-origin.x, -origin.y);
  },

  /*init_post_process: function() {
    var canvasPost = document.createElement('canvas');
    var ctxPost = canvasPost.getContext('2d');
    canvasPost.height = canvasPost.width = this.render_options.post_size;
    this.canvasPost = canvasPost;
    this.ctxPost = ctxPost;
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
  },*/

  tile: function(sql, callback, coord, zoom) {
    var self = this;
    var base_url = 'http://pulsemaps.cartodb.com/'
    var url = base_url + "api/v2/sql?q=" + encodeURIComponent(sql);

    if(!this.options.use_web_worker) {
      var prof = Profiler.get('tile fetching').start();

      var _url = "";

      if(location.search.indexOf('debug') != -1) {
        _url = url + "&format=arraybuffer"
      } else {
        _url = "http://" + VIZZUALITYCDN + "/scripts/data/bin/" + md5(url + "&format=arraybuffer") + ".bin?http_" + window.location.host + "&v=2";
      }

      get(_url, function(xhr) {
        prof.end();
        var length = xhr.response ? xhr.response.byteLength : 0;
        //console.log("tile size: " + ((length/1024) >> 0) + "kb");
        Profiler.new_value('tile_size', ((length/1024) >> 0));
        self.totalBytes += length;
        var data = null;
        if(xhr.response && xhr.response.byteLength) {
          data = new ArrayBufferSer(xhr.response);
        }
        callback(data);
        //console.log("total size: " + ((self.totalBytes/1024) >> 0) + "kb");
      });
    } else {
      var worker = this.workers[(coord.x + coord.y + zoom) % this.workers.length];
      var key = [coord.x, coord.y, zoom].join('/');
      this._web_workers_callbacks[key] = callback;
      var worker_callback = function(e) {
        //self.worker.removeEventListener("message", worker_callback);
        e = e.data;
        var coord = e.coord;
        var k = [coord.x, coord.y, coord.z].join('/')
        var c = self._web_workers_callbacks[k]
        if(c) {
          //console.log("<-", k);
          delete self._web_workers_callbacks[k]
          c(e);
        }
      }
      worker.addEventListener("message", worker_callback, false);
      //console.log("->", key);
      worker.postMessage(JSON.stringify({
        url: url,
        coord: {
          x: coord.x,
          y: coord.y,
          z: zoom
        },
        TIME_SLOTS: this.MAX_UNITS
      }));
    }
  },

  pre_cache_data2: function(rows, coord, zoom) {
    var row;
    var xcoords;
    var ycoords;
    var values;
    var key;

    var x = new Int32Array(rows.length);
    var y = new Int32Array(rows.length);
    //speeds = new Uint8Array(rows.length * this.MAX_UNITS);// 256 months
    var count = new Uint8Array(rows.length * this.MAX_UNITS);// 256 monthsrr
    var count_filtered = new Uint8Array(rows.length * this.MAX_UNITS);// 256 monthsrr

    Profiler.new_value('tiles mem 2', (2*4*rows.length + 3*rows.length*this.MAX_UNITS)/1024);

    var prof = Profiler.get('preprocess time 2').start();

    // base tile x, y
    var total_pixels = 256 << zoom;
    var max_val = 0;

    for (var i in rows) {
      row = rows[i];
      //pixels = meterToPixels(row.x, row.y, zoom); 
      pixels = tilePixelToPixel(coord.x, coord.y, zoom, row.x, row.y);
      //key = '' + (pixels[0] >> 0) + "_" + ((total_pixels - pixels[1])>>0)
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
        count[base_idx + row.dates[j]] = rows.vals[j];//Math.min(6, Math.ceil(row.vals[j]/(10 * this.options.step))) >> 0 ;
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
    //
    prof.end()

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

  pre_cache_data1: function(rows, coord, zoom) {
    var TIME_SLOTS = this.MAX_UNITS;
    var timeIndex = new Int32Array(TIME_SLOTS); //index-size
    var timeCount = new Int32Array(TIME_SLOTS); 
    var x = new Int32Array(rows.length);
    var y = new Int32Array(rows.length);


    var prof = Profiler.get('preprocess time').start();

 
    // count number of dates
    var dates = 0;
    for (var r = 0; r < rows.get('dates__uint16').length; ++r) {
      var row = rows.get('dates__uint16')[r];
      dates += row.length;
    }

    // reserve memory for all the dates
    var renderData = new Uint8Array(dates);
    var renderDataPos = new Uint32Array(dates);

    Profiler.new_value('tiles mem', (rows.length*2*4 + 2*TIME_SLOTS*4 + dates*(1 + 4))/1024);

    // precache pixel positions
    var total_pixels = 256 << zoom;
    var xx = rows.get('x__uint8');
    var yy = rows.get('y__uint8');
    for (var r = 0; r < rows.length; ++r) {
      var pixels = tilePixelToPixel(coord.x, coord.y, zoom, xx[r], yy[r]); 
      x[r] = pixels[0] | 0;
      y[r] = (total_pixels - pixels[1]) | 0;
    }

    // for each timeslot search active buckets
    var renderDataIndex = 0;
    var timeSlotIndex = 0;
    for(var i = 0; i < TIME_SLOTS; ++i) {
      var c = 0;
      for (var r = 0; r < rows.length; ++r) {
        var dates = rows.get('dates__uint16')[r];
        var vals = rows.get('vals__uint8')[r];
        for (var j = 0, len = dates.length; j < len; ++j) {
          if(dates[j] == i) {
            ++c;
            renderData[renderDataIndex] = vals[j];
            renderDataPos[renderDataIndex] = r;
            ++renderDataIndex;
          }
        }
      }
      timeIndex[i] = timeSlotIndex;
      timeCount[i] = c;
      timeSlotIndex += c;
    }

    prof.end();

    return {
      x: x,
      y: y,
      timeCount: timeCount,
      timeIndex: timeIndex,
      renderDataPos: renderDataPos,
      renderData: renderData
    }
  },

  _render1: function() {
    if(!this._canvas) return;
    var prof = Profiler.get('render').start();
    this._canvas.width = this._canvas.width;
    var origin = this._map._getNewTopLeftPoint(this._map.getCenter(), this._map.getZoom());
    this._ctx.translate(-origin.x, -origin.y);
    this._ctx.globalCompositeOperation = 'lighter';
    var reduction = this.options.reduction;

    var ctx = this._ctx;
    var time = this.time;
    var s = 2
    for(var tile in this._tiles) {
      var tt = this._tiles[tile]
      var activePixels = tt.timeCount[time];
      if(activePixels) {
        var pixelIndex = tt.timeIndex[time];
        for(var p = 0; p < activePixels; ++p) {
          var posIdx = tt.renderDataPos[pixelIndex + p];
          var c = tt.renderData[pixelIndex + p];
          if(c - reduction > 0) {
            var sp = this.sprites[c]
            ctx.drawImage(
              sp,
              tt.x[posIdx] - (sp.width>> 1),
              tt.y[posIdx] - (sp.height>>1) + 2*c)
          }
        }
      }
    }
    prof.end();
  },

  _render2: function() {
    if(!this._canvas) return;
    var prof = Profiler.get('render2').start();
    this._canvas.width = this._canvas.width;
    var origin = this._map._getNewTopLeftPoint(this._map.getCenter(), this._map.getZoom());
    /*
    this._ctx.setTransform(1, 0, 0, 1, 0, 0);
    this._ctx.fillStyle = 'rgba(23, 162, 206,'  + this.render_options.post_decay + ')';
    this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    */
    this._ctx.translate(-origin.x, -origin.y);

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

    prof.end();

  },


  // params for cities
  //  london: ac > 1200
  getProbsData: function(coord, zoom) {
    var self = this;

    var tiles_sql = encodeURIComponent("SELECT the_geom_webmercator,null as class,null as name,0 as attr2, 'nokia_oceans' as layer FROM mumbai_oceans_nokia UNION ALL SELECT the_geom_webmercator,null as class,null as name,0 as attr2, 'nokia_oceans' as layer FROM helsinki_oceans_nokia UNION ALL SELECT the_geom_webmercator,null as class,null as name,0 as attr2, 'nokia_oceans' as layer FROM rome_oceans_nokia UNION ALL SELECT the_geom_webmercator,feat_type as class,null as name,0 as attr2, 'nokia_landusage' as layer FROM london_landuse_nokia UNION ALL SELECT the_geom_webmercator,feat_type as class,null as name, 0 as attr2, 'nokia_landusage' as layer FROM chicago_landuse_nokia UNION ALL SELECT the_geom_webmercator,feat_type as class,null as name,0 as attr2, 'nokia_landusage' as layer FROM helsinki_landuse_nokia UNION ALL SELECT the_geom_webmercator,feat_type as class,null as name,0 as attr2, 'nokia_landusage' as layer FROM mumbai_landuse_nokia UNION ALL SELECT the_geom_webmercator,feat_type as class,null as name,0 as attr2,'nokia_landusage' as layer FROM rome_landuse_nokia UNION ALL SELECT the_geom_webmercator,feat_type as class, polygon_nm as name,0 as attr2, 'nokia_waterareas' as layer FROM london_waterareas_nokia UNION ALL SELECT the_geom_webmercator,feat_type as class, polygon_nm as name,0 as attr2, 'nokia_waterareas' as layer FROM chicago_waterareas_nokia UNION ALL SELECT the_geom_webmercator,feat_type as class, polygon_nm as name,0 as attr2, 'nokia_waterareas' as layer FROM helsinki_waterareas_nokia UNION ALL SELECT the_geom_webmercator,feat_type as class, polygon_nm as name,0 as attr2, 'nokia_waterareas' as layer FROM mumbai_waterareas_nokia UNION ALL SELECT the_geom_webmercator,feat_type as class, polygon_nm as name,0 as attr2, 'nokia_waterareas' as layer FROM rome_waterareas_nokia UNION ALL SELECT the_geom_webmercator,null as class,null as name,fc as att2, 'nokia_fullroads' as layer FROM cities_fullroads_2_nokia");
    var tiles_base_url = "http://0.tiles.cartocdn.com/pulsemaps/tiles/nokia_basemap/";
    var tiles_url = "{0}/{1}/{2}.png?sql=" + tiles_sql;

    var img = new Image();
    img.onload = function() {
      self._renderStreetTile(coord, img);
    }

    var _img = tiles_base_url + tiles_url.format(zoom, coord.x, coord.y);

    if(location.search.indexOf('debug') != -1) {
      img.src = _img;
    } else {
      var subdomain = ['a', 'b', 'c', 'd'][(coord.x + coord.y + zoom) % 4];
      img.src = "http://" +  subdomain + ".livingcities.cartocdn.com/images/tiles/" + md5(_img) + ".png"
    }


    var sql = "WITH par AS (" +
              " SELECT CDB_XYZ_Resolution({0}) as res" . format(zoom) +
              ", CDB_XYZ_Extent({0},{1},{2}) as ext "  
                .format(coord.x, coord.y, zoom) +
              "),\ncte AS ( SELECT ST_SnapToGrid(i.the_geom_webmercator, p.res) g" +
              ", {0} c" .format(this.options.countby) +
              ", floor(({0}- {1})/{2}) d"
                .format(this.options.column, this.options.start_date, this.options.step) +
              " FROM {0} i, par p " . format(this.options.table) +
              "WHERE i.the_geom_webmercator && p.ext " +
              "AND mm % {0} = 0 AND ac > 1200 ".format(this.options.decimate) +
              "GROUP BY g, d" +
              ") SELECT least((st_x(g)-st_xmin(p.ext))/p.res, 255) x__uint8, " +
                       "least((st_y(g)-st_ymin(p.ext))/p.res, 255) y__uint8," +
              " array_agg(least(6, ceil(c/100))) vals__uint8," +
              " array_agg(floor(d/{0})) dates__uint16" . format(this.options.decimate) +
              " FROM cte, par p GROUP BY x__uint8, y__uint8";

    this.tile(sql, function(data) {
      if(!self.options.use_web_worker) {
        var time_data = { timeCount: [] };
        if(data) {
          time_data = self.pre_cache_data(data, coord, zoom);
        }
      } else {
        time_data = data;
      }
      time_data.coord = coord;
      time_data.img = img;
      //console.log("loaded" , coord);
      self._tileLoaded(coord, time_data);
      self._renderSteets();
    }, coord, zoom);
  },

  _onTilesStartLoading: function() {
    Events.trigger('loading');
  },

  _onTilesFinishLoading: function() {
    Events.trigger('finish_loading');
  }


});

