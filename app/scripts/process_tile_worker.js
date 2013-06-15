importScripts('/scripts/util.min.js');
// importScripts('util.js');

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
  get(url, function(xhr) {
    var data = null;
    if(xhr && xhr.response && xhr.response.byteLength) {
      data = new ArrayBufferSer(xhr.response);
    }

    postMessage(pre_cache_data1(data, coord, zoom, TIME_SLOTS));

    processing = false;
    next();
  }, (coord.x + coord.y + zoom) % 4); //total hack
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

    var rowsPerSlot = [];

    // precache pixel positions
    var total_pixels = 256 << zoom;
    var xx = rows.get('x__uint8');
    var yy = rows.get('y__uint8');
    for (var r = 0; r < rows.length; ++r) {
      var pixels = tilePixelToPixel(coord.x, coord.y, zoom, xx[r], yy[r]); 
      x[r] = pixels[0] | 0;
      y[r] = (total_pixels - pixels[1]) | 0;

      var dates = rows.get('dates__uint16')[r];
      var vals = rows.get('vals__uint8')[r];
      for (var j = 0, len = dates.length; j < len; ++j) {
          var rr = rowsPerSlot[dates[j]] || (rowsPerSlot[dates[j]] = []);
          rr.push([r, vals[j]]);
      }
    }

    // for each timeslot search active buckets
    var renderDataIndex = 0;
    var timeSlotIndex = 0;
    for(var i = 0; i < TIME_SLOTS; ++i) {
      var c = 0;
      var slotRows = rowsPerSlot[i]
      if(slotRows) {
        for (var r = 0; r < slotRows.length; ++r) {
          var rr = slotRows[r];
          ++c;
          renderDataPos[renderDataIndex] = rr[0]
          renderData[renderDataIndex] = rr[1];
          ++renderDataIndex;
        }
      }
      /*
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
      */
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
