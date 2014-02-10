ProcessCanvas.extend({
  drawBubbleTextLeft: function(x, y, width, height, opts){
    var ctx = this.context;
    opts = this.prepareShapeOpts(x, y, width, height, opts);
    this.beginPath(opts);
      ctx.moveTo(x+50, y);
      ctx.quadraticCurveTo(x,     y,    x,     y+(height*0.375));
      ctx.quadraticCurveTo(x,     y+(height*0.75), x+(width*0.25),  y+(height*0.75));
      ctx.quadraticCurveTo(x+(width*0.25),  y+(height*0.95), x+(width*0.05),   y+height);
      ctx.quadraticCurveTo(x+(width*0.35),  y+(height*0.95), x+(width*0.40),  y+(height*0.75));
      ctx.quadraticCurveTo(x+width, y+(height*0.75), x+width, y+(height*0.375));
      ctx.quadraticCurveTo(x+width, y,    x+(width*0.5),  y);
    this.closePath(opts);
    this.applyStrokeFill(opts);
  },
  drawHeart: function(x, y, width, height, opts){
    var ctx = this.context;
    opts = this.prepareShapeOpts(x, y, width, height, opts);
    this.beginPath(opts);
      ctx.moveTo(x+width*0.55,y+height*0.15);
      ctx.bezierCurveTo(x+width*0.55, y+height*0.12, x+width*0.5, y, x+width*0.3, y);
      ctx.bezierCurveTo(x, y, x, y+height*0.375, x, y+height*0.375);
      ctx.bezierCurveTo(x, y+height*0.55, x+width*0.2, y+height*0.77, x+width*0.55, y+height*0.95);
      ctx.bezierCurveTo(x+width*0.9, y+height*0.77, x+width*1.1, y+height*0.55, x+width*1.1, y+height*0.375);
      ctx.bezierCurveTo(x+width*1.1, y+height*0.375, x+width*1.1, y, x+width*0.8, y);
      ctx.bezierCurveTo(x+width*0.65, y, x+width*0.55, y+height*0.12, x+width*0.55, y+height*0.15);
    this.closePath(opts);
    this.applyStrokeFill(opts);
  },
  drawCloud: function(x, y, width, height, opts){
    var context = this.context;
    opts = this.prepareShapeOpts(x, y, width, height, opts);
    this.beginPath(opts);
      context.moveTo(x+width*0.133333333333333, y+height*0.428571428571429);
      context.bezierCurveTo(x+width*0, y+height*0.542857142857143, x+width*0, y+height*0.828571428571429, x+width*0.333333333333333, y+height*0.828571428571429);
      context.bezierCurveTo(x+width*0.4, y+height*1, x+width*0.633333333333333, y+height*1, x+width*0.7, y+height*0.828571428571429);
      context.bezierCurveTo(x+width*0.966666666666667, y+height*0.828571428571429, x+width*0.966666666666667, y+height*0.657142857142857, x+width*0.866666666666667, y+height*0.542857142857143);
      context.bezierCurveTo(x+width*1, y+height*0.2, x+width*0.8, y+height*0.142857142857143, x+width*0.7, y+height*0.257142857142857);
      context.bezierCurveTo(x+width*0.633333333333333, y+height*0, x+width*0.4, y+height*0.0857142857142857, x+width*0.4, y+height*0.257142857142857);
      context.bezierCurveTo(x+width*0.233333333333333, y+height*0, x+width*0.0666666666666667, y+height*0.0857142857142857, x+width*0.133333333333333, y+height*0.428571428571429);
    this.closePath(opts);
    this.applyStrokeFill(opts);
  }
});
