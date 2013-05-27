
importScripts('/js/util.js');

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
  req.open("GET", url, true)
  //req.responseType = 'arraybuffer';
  req.send(null)
  return req;
}

var queue = [];
var processing = false;

function next() {
  if(!processing) {
    processing = true;
    var n = queue.pop()
    if(n) {
      get_data(n.url, n.coord, n.coord.z, n.TIME_SLOTS);
    } else {
      processing = false
    }
  }
}
function get_data(url, coord, zoom, TIME_SLOTS) {
    get(url, function (xhr) {
      var data = JSON.parse(xhr.responseText);
      postMessage(pre_cache_data1(data.rows, coord, zoom, TIME_SLOTS))
      processing = false;
      next();
    });
}

function pre_cache_data1(rows, coord, zoom, TIME_SLOTS) {
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
      var pixels = tilePixelToPixel(coord.x, coord.y, zoom, row.x, row.y); 
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
