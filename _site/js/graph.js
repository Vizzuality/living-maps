
function graph(data, w, h, color) {
  var canvas = document.createElement('canvas');
  var max = 0;

  // normalize
  var len = data.length, i;
  for(i = 0; i < len; ++i) {
    max = Math.max(data[i], max);
  }
  for(i = 0; i < len; ++i) {
    data[i] /= max;
  }

  //render
  canvas.width = w;
  canvas.height = h;
  var barw = w/len;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  for(i = 0; i < len; ++i) {
    var hh = (h * data[i]) >> 0;
    ctx.fillRect(i*barw, h - hh, barw, h);
  }
  return canvas;
}
