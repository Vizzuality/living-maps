
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
    table: "london_2m_1mm", //"all_2m_live_5mm", //"direction_test_5mina", //"r_even",
    column: "mm",
    countby: "sqrt(avg(ac))",
    resolution: 1,
    step: 1,
    decimate: get_debug_param('decimation', 3),
    start_date: 1, //'2013-03-22 00:00:00+00:00',
    end_date: 1419//'2013-03-22 23:59:57+00:00'
  },

  initialize: function(options) {
    _.extend(this.options, options);
    L.CanvasLayer.prototype.initialize.call(this);
    this.on('tileAdded', function(t) {
      this.getProbsData(t, t.zoom);
    }, this);
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
    this.precache_sprites = this.precache_sprites.bind(this)
    this.init_post_process = this.init_post_process.bind(this);

    this.precache_sprites();
  },

  setCity: function(name) {
    //this.options.table = name + "_2m_1mm";
    this.options.table = name + "_manydays_live";
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
    this._streetsLayerCtx.globalAlpha = 0.5;
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
    this.time = (this.time/this.options.decimate) >> 0;
  },

  onAdd: function (map) {
    map.on('move reset', this._onMapMove, this);
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
    this._streetsLayer.style['zIndex'] = 50;
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

  tile: function(sql, callback) {
    var self = this;
    var base_url = 'http://pulsemaps.cartodb.com/'
    $.getJSON(base_url + "api/v2/sql?q=" + encodeURIComponent(sql), function (data, text, xhr) {
      console.log("tile size: " + ((xhr.responseText.length/1024) >> 0) + "kb");
      self.totalBytes += xhr.responseText.length;
      callback(data);
      console.log("total size: " + ((self.totalBytes/1024) >> 0) + "kb");
    });
  },

  pre_cache_data: function(rows, coord, zoom) {
    var TIME_SLOTS = this.MAX_UNITS;
    var timeIndex = new Int32Array(TIME_SLOTS); //index-size
    var timeCount = new Int32Array(TIME_SLOTS); 
    var x = new Int32Array(rows.length);
    var y = new Int32Array(rows.length);

    // count number of dates
    var dates = 0;
    for (var r in rows) {
      var row = rows[r];
      dates += row.dates.length;
    }

    // reserve memory for all the dates
    var renderData = new Uint8Array(dates);
    var renderDataPos = new Uint32Array(dates);

    // precache pixel positions
    var total_pixels = 256 << zoom;
    for (var r in rows) {
      var row = rows[r];
      var pixels = meterToPixels(row.x, row.y, zoom); 
      x[r] = pixels[0] | 0;
      y[r] = (total_pixels - pixels[1]) | 0;
    }

    // for each timeslot search active buckets
    var renderDataIndex = 0;
    var timeSlotIndex = 0;
    for(var i = 0; i < TIME_SLOTS; ++i) {
      var c = 0;
      for (var r in rows) {
        var row = rows[r];
        for (var j = 0, len = row.dates.length; j < len; ++j) {
          if(row.dates[j] == i) {
            ++c;
            renderData[renderDataIndex] = row.vals[j];
            renderDataPos[renderDataIndex] = r;
            ++renderDataIndex;
          }
        }
      }
      timeIndex[i] = c;
      timeCount[i] = timeSlotIndex;
      timeSlotIndex += c;
    }

    return {
      x: x,
      y: y
      timeIndex: timeIndex,
      renderDataPos: renderDataPos,
      renderData: renderData
    }
  },

  // tile format
  //
  // ** header
  // - file tag: 84, 79, 82, 81, 85, 69  [int8 * 5] ("TORQUE" in ascii)
  // - file version [int8] (0, 1, 2, 3...)
  //
  // ** data
  // - n_pixels with data [uint32]
  // - time_slots [uint32]
  // - x coords [int32*n_pixels]
  // - y coords [int32*n_pixels]
  // - timeIndex [int32*time_slots]
  // - timeCount [int32*time_slots]
  //   this value return the index in renderData and renderDataPos for a time slot
  // - renderDataPos [uint32, index in x,y array for time t] 
  //    contains the positions for each pixel, indexed by time index
  // - renderData
  //    contains the values for pixels, indexed by timeIndex
  //
  //
  // example: how to get the values and the pixel positions in the time slot "time"
  // var index = timeIndex[time]
  // var pixelsToRender = timeCount[index]
  // for(var i = 0; i < pixelsToRender; ++i) {
  //    var posIndex = renderDataPos[index + i]
  //    var value = renderData[index + i];
  //    render_at(x[posIndex], y[posIndex], value);
  // }
  //

  _render: function() {
    if(!this._canvas) return;
    this._canvas.width = this._canvas.width;
    var origin = this._map._getNewTopLeftPoint(this._map.getCenter(), this._map.getZoom());
    this._ctx.translate(-origin.x, -origin.y);
    this._ctx.globalCompositeOperation = 'lighter';

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
          if(c) {
            var sp = this.sprites[c]
            ctx.drawImage(
              sp,
              tt.x[posIdx] - (sp.width>> 1),
              tt.y[posIdx] - (sp.height>>1) + 2*c)
          }
        }
      }
    }

  },

  // params for cities
  //  london: ac > 1200
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
    "    x, y, array_agg(least(6,  ceil(c/100))) vals, array_agg(floor(d/{0})) dates ".format(this.options.decimate) +
    " FROM ( " +
    "    SELECT " +
    "      round(CAST (st_xmax(hgrid.cell) AS numeric),4) x, round(CAST (st_ymax(hgrid.cell) AS numeric),4) y, " +
    "      {0} c, floor(({1}- {2})/{3}) d ".format(this.options.countby, this.options.column, this.options.start_date, this.options.step) +
    "    FROM " +
    "        hgrid, {0} i ".format(this.options.table) +
    "    WHERE " +
    "        i.the_geom_webmercator && CDB_XYZ_Extent({0}, {1}, {2}) ".format(coord.x, coord.y, zoom) +
    "        AND mm % {0} = 0 AND ac > 1200 AND ST_Intersects(i.the_geom_webmercator, hgrid.cell) ".format(this.options.decimate) +
    "    GROUP BY " +
    "        hgrid.cell, floor(({0} - {1})/{2})".format(this.options.column, this.options.start_date, this.options.step) +
    " ) f GROUP BY x, y";


    var tiles_sql = encodeURIComponent("SELECT the_geom_webmercator,class,null as name,'osm_landusages' as layer FROM mumbai_osm_landusages UNION ALL SELECT the_geom_webmercator,class,null as name,'osm_landusages' as layer FROM london_osm_landusages UNION ALL SELECT the_geom_webmercator,class, name,'osm_waterareas' as layer FROM mumbai_osm_waterareas UNION ALL SELECT the_geom_webmercator,class, name,'osm_waterareas' as layer FROM london_osm_waterareas UNION ALL SELECT the_geom_webmercator,class,null as name,'osm_roads' as layer FROM mumbai_osm_roads UNION ALL SELECT the_geom_webmercator,class,null as name,'osm_roads' as layer FROM london_osm_roads");
    var tiles_url = "http://0.tiles.cartocdn.com/pulsemaps/tiles/pulse_basemap/{0}/{1}/{2}.png?cache_policy=persist&sql=" + tiles_sql + "&cache_policy=persist&cache_buster=2013-05-09T12%3A49%3A08%2B00%3A00&cache_buster=" + new Date().getTime();

    //var tiles_url = "http://0.tiles.cartocdn.com/pulsemaps/tiles/basemap_roads_live/{0}/{1}/{2}.png?cache_buster=101"
    var img = new Image();
    img.src = tiles_url.format(zoom, coord.x, coord.y);
    img.onload = function() {
      self._renderSteets();
    }

    this.tile(sql, function (data) {
      var time_data = self.pre_cache_data(data.rows, coord, zoom);
      time_data.coord = coord;
      time_data.img = img;
      self._tileLoaded(coord, time_data);
      self._renderSteets();
    });
  },

  _onTilesStartLoading: function() {
    Events.trigger('loading');
  },

  _onTilesFinishLoading: function() {
    Events.trigger('finish_loading');
  }


});

