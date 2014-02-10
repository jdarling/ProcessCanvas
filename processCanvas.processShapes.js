ProcessCanvas.extend({
  prepareProcessOpts: function(x, y, width, height, options){
    var opts = {}, propName;
    for(propName in options) opts[propName] = options[propName];
    opts.startColor = opts.startColor||'white';
    opts.endColor = opts.endColor||'#dce0e9';
    opts.barInset = opts.barInset||this.defaults.barInset||7;//.5;
    opts.shadowOffsetX = opts.shadowOffsetX||2;
    opts.shadowOffsetY = opts.shadowOffsetY||2;
    opts.shadowBlur = opts.shadowBlur||5;
    opts.shadowColor = opts.shadowColor||'#999';
    if(typeof(opts.fillStyle)=='undefined'){
      opts.fillStyle = this.context.createLinearGradient(0, y, 0, y+height);
      opts.fillStyle.addColorStop(0, opts.startColor);
      opts.fillStyle.addColorStop(1, opts.endColor);
    }
    return opts;
  },
  drawRoundedProcess: function(x, y, width, height, options){
    x = Math.floor(x);
    y = Math.floor(y)+0.5;
    var opts = this.prepareProcessOpts(x, y, width, height, options);
    this.drawRoundRect(x, y, width, height, opts);
  },
  drawProcess: function(x, y, width, height, options){
    x = Math.floor(x);
    y = Math.floor(y)+0.5;
    var opts = this.prepareProcessOpts(x, y, width, height, options);
    this.drawRect(x, y, width, height, opts);
  },
  drawExternalProcess: function(x, y, width, height, options){
    x = Math.floor(x);
    y = Math.floor(y)+0.5;
    var opts = this.prepareProcessOpts(x, y, width, height, options, true);
    this.drawRect(x, y, width, height, opts);
    this.drawLine(x+opts.barInset, y, x+opts.barInset, y+height);
    this.drawLine(x+width-opts.barInset, y, x+width-opts.barInset, y+height);
  },
  drawRoundedExternalProcess: function(x, y, width, height, options){
    x = Math.floor(x);
    y = Math.floor(y)+0.5;
    var opts = this.prepareProcessOpts(x, y, width, height, options, true);
    this.drawRoundRect(x, y, width, height, opts);
    this.drawLine(x+opts.barInset, y, x+opts.barInset, y+height);
    this.drawLine(x+width-opts.barInset, y, x+width-opts.barInset, y+height);
  },
  drawDatabase: function(x, y, width, height, options){
    x = Math.floor(x)+0.375;
    y = Math.floor(y)+0.5;//+0.5;
    var opts = this.prepareProcessOpts(x, y, width, height, options), 
        discOffset, 
        opts2 = {shadowColor: 'transparent black', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0}, 
        paramName,
        midx = x + width / 2,
        right = x + width,
        bottom = y+height,
        kappa = 0.5522848,
        ox = (width/2)*kappa,
        oy;
    opts.dbDiscSize = opts.dbDiscSize||20;
    oy = (opts.dbDiscSize/2)*kappa;
    discOffset = opts.dbDiscSize / 2;
    opts.textOffsetTop += opts.dbDiscSize;
    for(paramName in opts){
      if(paramName.substring(0, 6)!='shadow') opts2[paramName] = opts[paramName];
    }
    this.beginPath(opts);
      this.context.moveTo(x, y+discOffset);
      this.context.lineTo(right, y+discOffset);
      this.context.lineTo(right, y+height-discOffset);
      this.context.bezierCurveTo(right, y+height-discOffset + oy, midx + ox, bottom, midx, bottom);
      this.context.bezierCurveTo(midx - ox, bottom, x, y+height-discOffset + oy, x, y+height-discOffset);
      this.context.lineTo(x, y+discOffset);
    this.closePath(opts);
    this.applyStrokeFill(opts);
    
    this.drawEllipse(x, y, width, opts.dbDiscSize, opts2);
  },
  drawExternalData: function(x, y, width, height, options){
    y = Math.floor(y)+0.5;
    var opts = this.prepareProcessOpts(x, y, width, height, options),
        dbDiscSize = opts.dbDiscSize||40,
        discOffset = dbDiscSize/2,
        kappa = 0.5522848,
        w = dbDiscSize,
        h = height,
        x2= x+width,
        ox = (w / 2) * kappa, // control point offset horizontal
        oy = (h / 2) * kappa, // control point offset vertical
        xe = x + w,           // x-end
        ye = y + h,           // y-end
        xm = x + w / 2,       // x-middle
        ym = y + h / 2;       // y-middle
    opts.textOffsetLeft = Math.max(opts.textOffsetLeft, discOffset);
    opts.textOffsetRight = Math.max(opts.textOffsetRight, discOffset);
    this.beginPath(opts);
      this.context.moveTo(xm, ye);
      this.context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
      this.context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
      this.context.lineTo(x+width, y);
      this.context.bezierCurveTo(x2-ox, y, x2-discOffset, ym-oy, x2-discOffset, ym);
      this.context.bezierCurveTo(x2-discOffset, ym+oy, x2-ox, ye, x2, ye);
      this.context.lineTo(xm, ye);
    this.closePath(opts);
    this.applyStrokeFill(opts);
  },
  drawDocument: function(x, y, width, height, options){
    var opts = this.prepareProcessOpts(x, y, width, height, options),
        mx = width / 2,
        w1 = mx+mx/3,
        w2 = mx-mx/3,
        h1 = height-30,
        h2 = height-15;
    this.beginPath(opts);
      this.context.moveTo(x, y+h2);
      this.context.lineTo(x, y);
      this.context.lineTo(x+width, y);
      this.context.lineTo(x+width, y+height);
      this.context.bezierCurveTo(x+width, y+h1, x+w1, y+h1, x+mx, y+h2);
      this.context.bezierCurveTo(x+w2, y+height, x, y+height, x, y+h2);
    this.closePath(opts);
    this.applyStrokeFill(opts);
  }
});