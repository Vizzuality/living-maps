
var Entities = function(size, remove_callback) {
    this.x = new Float32Array(size);
    this.y = new Float32Array(size);
    this.dx = new Float32Array(size);
    this.dy = new Float32Array(size);
    this.life = new Float32Array(size);
    this.strong = new Float32Array(size);
    this.current_life = new Float32Array(size);
    this.remove = new Int32Array(size);
    this.type = new Int8Array(size);
    this.last = 0;
    this.size = size;
    this.sprites = this.pre_cache_sprites('red');
}

Entities.prototype.pre_cache_sprites = function(color) {
  var sprites = []
  for(var i = 0; i < 4; ++i) {
    var pixel_size = i + 1;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    ctx.width = canvas.width = pixel_size * 2;
    ctx.height = canvas.height = pixel_size * 2;
    ctx.fillStyle = 'rgba(255, 255, 255, ' + ((i + 1)/18.0) + ')';
    ctx.beginPath();
    ctx.arc(pixel_size, pixel_size, pixel_size, 0, Math.PI*2, true, true);
    ctx.closePath();
    ctx.fill();
    sprites.push(canvas);
  }
  return sprites;
}

Entities.prototype.add = function(x, y, dx, dy, life, strong) {
  if(this.last < this.size) {
    this.x[this.last] = x;
    this.y[this.last] = y;
    this.dx[this.last] = dx;
    this.dy[this.last] = dy;
    this.strong[this.last] = strong;
    this.life[this.last] = life;
    this.current_life[this.last] = 0;
    this.last++;
  }
}

Entities.prototype.dead = function(i) {
  return false;
}

Entities.prototype.render = function(ctx) {
  var s, t;
  for(var i = 0; i < this.last ; ++i) {
    var s = this.strong[i] >> 0;
    //s = Math.min(s, 3);
    /*s = (this.current_life[i])>>0;
 y   */
 /*
    ctx.beginPath();
    ctx.moveTo(this.x[i], this.y[i]);
    ctx.lineTo(this.x[i] - this.dx[i], this.y[i] - this.dy[i]);
    ctx.stroke();
    */
    //ctx.fillStyle= 'rgba(255, 255, 255,' + this.strong[i] + ')';
    //ctx.fillRect(this.x[i]-1, this.y[i]-1, 2, 2);
    ctx.fillRect(this.x[i], this.y[i], 1, 1);
    /*
    ctx.drawImage(this.sprites[s], 
      (this.x[i] - s*2)>>0, 
      (this.y[i] - s*2)>>0);
    */
  }

}

Entities.prototype.update = function(dt) {
    var len = this.last;
    var removed = 0;
    var _remove = this.remove;

    for(var i = len - 1; i >= 0; --i) {
        var diff = this.life[i] - this.current_life[i];
        this.current_life[i] += diff*4*dt;
        this.x[i] += this.dx[i]*dt;
        this.y[i] += this.dy[i]*dt;
        if(diff <= 0.05) {
          _remove[removed++] = i;
        }
    }

    for(var ri = 0; ri < removed; ++ri) {
      var r = _remove[ri];
      var last = this.last - 1;
      // move last to the removed one and remove it
      this.x[r] = this.x[last];
      this.y[r] = this.y[last];
      this.dx[r] = this.dx[last];
      this.dy[r] = this.dy[last];
      this.strong[r] = this.strong[last];
      this.life[r] = this.life[last];
      this.current_life[r] = this.current_life[last]
      this.type[r] = this.type[last];

      this.last--;
    }
};
