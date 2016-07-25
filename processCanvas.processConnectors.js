(function(container, factory){
  // AMD Loader
  if(typeof define === "function" && define.amd) {
    return define(['ProcessCanvas'], factory);
  }

  // CommonJS
  if(typeof module === "object" && module.exports) {
    return module.exports = factory(require('./processCanvas'));
  }

  // Normal browser
  return (function(exports){
    var keys = Object.keys(exports || {});
    keys.forEach(function(key){
      container[key] = exports[key];
    });
    return container;
  }(factory(container.ProcessCanvas)));
}(this, function(ProcessCanvas){
  ProcessCanvas.extend({
    drawHorizontalConnection: function(fromX, fromY, toX, toY, opts){
      var pointingRight = toX>fromX,
          x1 = fromX,
          y1 = fromY,
          x2,
          x3 = toX,
          y2 = toY,
          oldFill = opts?opts.fill:true;
      opts = opts||{};
      if(opts.offsetX1){
        if(pointingRight) x1 += opts.offsetX1;
        else x1 -= opts.offsetX1;
      }
      if(opts.offsetX2){
        if(pointingRight) x3 -= opts.offsetX2;
        else x3 += opts.offsetX2;
      }
      x2 = opts.midX||(pointingRight?x1+((x3-x1)/2):x3+((x1-x3)/2));
      opts.fill = false;
      //this.beginPath(opts);
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y1);
        this.context.lineTo(x2, y2);
        this.context.lineTo(x3, y2);
        this.context.moveTo(x1, y1);
      //this.closePath(opts);
      this.applyStrokeFill(opts);
      opts.fill = oldFill;
      this.drawConnectorEndpoint(x1, y1, opts.startStyle, pointingRight?'left':'right');
      this.drawConnectorEndpoint(x3, y2, opts.endStyle, pointingRight?'right':'left');
    },
    drawVerticalConnection: function(fromX, fromY, toX, toY, opts){
      var pointingDown = toY>fromY,
          x1 = fromX,
          y1 = fromY,
          x2 = toX,
          y2,
          y3 = toY,
          oldFill = opts?opts.fill:true;
      opts = opts||{};
      if(opts.offsetY1){
        if(pointingDown) y1 += opts.offsetY1;
        else y1 -= opts.offsetY1;
      }
      if(opts.offsetY2){
        if(pointingDown) y3 -= opts.offsetY2;
        else y3 += opts.offsetY2;
      }
      y2 = pointingDown?y3-20:y3+20;//opts.midY||(pointingDown?y1+((y3-y1)/2):y1-((y1-y3)/2));
      opts.fill = false;
      //this.beginPath(opts);
        this.context.moveTo(x1, y1);
        this.context.lineTo(x1, y2);
        this.context.lineTo(x2, y2);
        this.context.lineTo(x2, y3);
        this.context.moveTo(x1, y1);
      //this.closePath(opts);
      this.applyStrokeFill(opts);
      opts.fill = oldFill;
      this.drawConnectorEndpoint(x2, y3, opts.endStyle, pointingDown?'down':'up');
      this.drawConnectorEndpoint(x1, y1, opts.startStyle, pointingDown?'up':'down');
    },
    drawConnectorEndpoint: function(atX, atY, type, direction, opts){
      if(!(type&&direction)) return;
      switch(type.toLowerCase()){
        case('arrow'):
          this.beginPath(opts);
            this.context.moveTo(atX, atY);
            switch(direction.toLowerCase()){
              case('down'):
                this.context.lineTo(atX+4, atY-9);
                this.context.lineTo(atX, atY-6);
                this.context.lineTo(atX-4, atY-9);
                break;
              case('up'):
                this.context.lineTo(atX+4, atY+9);
                this.context.lineTo(atX, atY+6);
                this.context.lineTo(atX-4, atY+9);
                break;
              case('left'):
                this.context.lineTo(atX+9, atY-4);
                this.context.lineTo(atX+6, atY);
                this.context.lineTo(atX+9, atY+4);
                break;
              case('right'):
                this.context.lineTo(atX-9, atY-4);
                this.context.lineTo(atX-6, atY);
                this.context.lineTo(atX-9, atY+4);
                break;
            }
            this.context.lineTo(atX, atY);
          this.closePath(opts);
          this.applyStrokeFill(opts);
          break;
        case('ball'):
        case('circle'):
          this.drawEllipse(atX-2.5, atY-2.5, 5, 5, opts);
          break;
        case('square'):
          this.drawRect(atX-2.5, atY-2.5, 5, 5, opts);
          break;
      }
    },
    drawConnection: function(fromX, fromY, toX, toY, opts){
      var distX = (toX-fromX>0)?toX-fromX:fromX-toX, distY = (toY-fromY>0)?toY-fromY:fromY-toY;
      if(distX>distY) this.drawHorizontalConnection(fromX, fromY, toX, toY, opts);
      else this.drawVerticalConnection(fromX, fromY, toX, toY, opts);
    }
  });
}));
