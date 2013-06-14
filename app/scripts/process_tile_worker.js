// importScripts('/scripts/util.min.js');
importScripts('util.js');

var queue = [];
var processing = false;

function next() {
  if(!processing) {
    processing = true;
    var n = queue.pop()
    if(n) {
      get_data(n.url + "&format=arraybuffer", n.coord, n.coord.z, n.TIME_SLOTS);
    } else {
      processing = false
    }
  }
}

function get_data(url, coord, zoom, TIME_SLOTS) {
  var _url;
  if(location.search.indexOf('debug') != -1) {
    _url = url;
  } else {
    var subdomain = ['a', 'b', 'c', 'd'][(coord.x + coord.y + zoom) % 4];
    //var _url = "http://com.vizzuality.livingcities.s3-website-us-east-1.amazonaws.com/scripts/data/bin/" + md5(url) + ".bin";
    _url = "http://" +  subdomain + ".livingcities.cartocdn.com/scripts/data/bin/" + md5(url) + ".bin";
  }

  get(url, function(xhr) {
    var data = null;
    if(xhr && xhr.response && xhr.response.byteLength) {
      data = new ArrayBufferSer(xhr.response);
    }

    postMessage(pre_cache_data1(data, coord, zoom, TIME_SLOTS));

    processing = false;
    next();
  });
}

function pre_cache_data1(rows, coord, zoom, TIME_SLOTS) {
    if(!rows) {
      return {
        coord: {
          x: coord.x,
          y: coord.y,
          z: zoom,
        },
        timeCount: [],
      }
    }
    var timeIndex = new Int32Array(TIME_SLOTS); //index-size
    var timeCount = new Int32Array(TIME_SLOTS); 
    var x = new Int32Array(rows.length);
    var y = new Int32Array(rows.length);
 
    // count number of dates
    var dates = 0;
    for (var r = 0; r < rows.get('dates__uint16').length; ++r) {
      var row = rows.get('dates__uint16')[r];
      dates += row.length;
    }

    // reserve memory for all the dates
    var renderData = new Uint8Array(dates);
    var renderDataPos = new Uint32Array(dates);

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

    return {
      x: x,
      y: y,
      coord: {
        x: coord.x,
        y: coord.y,
        z: zoom,
      },
      timeCount: timeCount,
      timeIndex: timeIndex,
      renderDataPos: renderDataPos,
      renderData: renderData
    }
}

onmessage = function (event) {
  var data = JSON.parse(event.data);
  queue.push(data);
  next();
};
