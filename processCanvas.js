/*
  Unit:         ProcessCanvas.js
  Author:       Jeremy Darling
  Last Update:  October 24th 2011

  Description:
    The ProcessCanvas unit implements a canvas wrapper method that takes an
    existing canvas object and converts it into an ProcessCanvas instance.
    This introduces new functionality and features at the object level for
    drawing.
*/
var ProcessCanvas = (function(){
  return {
    extend: function(){
      var argIdx, arg, property;
      for(argIdx = 0; argIdx<arguments.length; argIdx++){
        arg = arguments[argIdx];
        for(property in arg){
          this[property] = arg[property];
        }
      }
    }
  };
})(),

ProcessCanvasCustomEvent = function(source, name){
  var listeners = new Array(),
      inIE = document.attachEvent && (!document.addEventListener),
      event = this,

      isEventSupported = function(eventName, element) {
        var undef, isSupported;
        element = element || document.createElement(TAGNAMES[eventName] || 'div');
        eventName = 'on' + eventName;

        isSupported = (eventName in element);

        if (!isSupported) {
          // if it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
          if (!element.setAttribute) {
            element = document.createElement('div');
          }
          if (element.setAttribute && element.removeAttribute) {
            element.setAttribute(eventName, '');
            isSupported = typeof element[eventName] == 'function';

            // if property was created, "remove it" (by setting value to `undefined`)
            if (typeof element[eventName] != 'undefined') {
              element[eventName] = undef;
            }
            element.removeAttribute(eventName);
          }
        }

        element = null;
        return isSupported;
      },
      isNative = isEventSupported(name, source),//(inIE)?((typeof(source['on'+name])=='object')?true:false):((typeof(source[name])=='undefined')?false:true);

      listenFor = (!inIE)?function(callback, useCapture){ // Firefox, Chrome, Opera
        source.addEventListener(name, callback, useCapture||false);
      }:function(callback){ // IE Only
        source.attachEvent('on'+name, callback);
      },
      stopListeningFor = (!inIE)?function(callback, useCapture){ // Firefox, Chrome, Opera
        source.removeEventListener(name, callback, useCapture||false);
      }:function(callback){ // IE Only
        source.detachEvent('on'+name, callback);
      },
      fireEvent = (!inIE)?function(args){ // Firefox, Chrome, Opera
        var evt = document.createEvent("HTMLEvents"), i;
        evt.initEvent(name, true, true ); // event type,bubbling,cancelable
        for(i in args) evt[i] = args[i];
        return !source.dispatchEvent(evt);
      }:function(args){
        var evt = document.createEventObject(), i;
        for(i in args) evt[i] = args[i];
        return source.fireEvent('on'+name, evt);
      };

  event.name = name;
  event.exists = function(callback){
    var i;
    if(isNative) return true;
    for(i in listeners){
      if(listeners[i]==callback) return true;
    }
    return false;
  };
  event.subscribe = function(callback){
    if(isNative) listenFor(callback);
    else if(!event.exists(callback)) listeners.push(callback);
    return callback;
  };
  event.unsubscribe = function(callback){
    var i;
    if(isNative){
      stopListeningFor(callback);
      return true;
    }else for(i in listeners){
      if(listeners[i]==callback){
        listeners.splice(i, 1);
        return true;
      }
    }
    return false;
  };
  event.dispatch = function(){
    var halt = false, i, args = Array.prototype.slice.call(arguments);
    if(isNative) return fireEvent(args);
    else for(i in listeners){
      if(halt = listeners[i].apply(source, args)||false) return true;
    }
    return halt;
  };
  return event;
},

ProcessCanvasEvents = function(forObject){
  var _custom_events = {}, ProcessCanvasEvents = {
    handler: function(eventName){
      if(!(handler = _custom_events[eventName])) handler = _custom_events[eventName] = new ProcessCanvasCustomEvent(forObject, eventName);
      return handler;
    },
    subscribe: function(eventName, callback){
      this.handler(eventName).subscribe(callback);
    },
    unsubscribe: function(eventName, callback){
      this.handler(eventName).unsubscribe(callback);
    },
    dispatch: function(eventName, data){
      return this.handler(eventName).dispatch(forObject, data||{});
    }
  };
  return ProcessCanvasEvents;
},

ProcessCanvasTextBlock = function(){
};

ProcessCanvas.extend({
  defaults: {
    strokeStyle: 'black',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    miterLimit: 10,
    fillStyle: 'black',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowColor: 'transparent black',
    shadowBlur: 0,
    cornerRadius: 10,
    font: '14px Optimer',
    textBaseline: 'top',
    textAlign: 'left',
    textLineWidth: 1,
    textFillStyle: 'black',
    textStrokeStyle: 'black',
    textShadowOffsetX: 0,
    textShadowOffsetY: 0,
    textShadowBlur: 0,
    textShadowColor: 'transparent black',
    stroke: true,
    fill: true
  },

  init: function(from, opts){
    var instance = from, property;
    for(property in ProcessCanvas) instance[property] = ProcessCanvas[property];
    instance.context = instance.getContext('2d');
    instance.viewScale = 1;
    if(opts) for(property in opts){
      instance[property] = opts[property];
    }
    instance.translation= {x: 0, y: 0};
    instance.dragLimits= false;
    instance.events = new ProcessCanvasEvents(instance);
    instance.applyDefaultOptions();
    if(instance.className.split(' ').indexOf('ProcessCanvas')<0) instance.className += ' ProcessCanvas';
    return instance;
  },

  subscribe: function(eventName, callback){
    this.events.subscribe(eventName, callback);
  },
  unsubscribe: function(eventName, callback){
    this.events.unsubscribe(eventName, callback);
  },
  dispatch: function(eventName, data){
    return this.events.dispatch(eventName, data||{});
  },

  prepareShapeOpts: function(x, y, width, height, options){
    var opts = {}, propName;
    for(propName in options) opts[propName] = options[propName];
    opts.shadowOffsetX = opts.shadowOffsetX||2;
    opts.shadowOffsetY = opts.shadowOffsetY||2;
    opts.shadowBlur = opts.shadowBlur||5;
    opts.shadowColor = opts.shadowColor||'#999';
    if(typeof(opts.fillStyle)=='undefined'){
      opts.startColor = opts.startColor||'white';
      opts.endColor = opts.endColor||'#dce0e9';
      opts.fillStyle = this.context.createLinearGradient(0, y, 0, y+height);
      opts.fillStyle.addColorStop(0, opts.startColor);
      opts.fillStyle.addColorStop(1, opts.endColor);
    }
    return opts;
  },

  setDims: function(width, height){
    if(width&&width.width){
      this.width = width.width;
      this.height = width.height;
    }else{
      this.width = width;
      this.height = height;
    }
    this.invalidate();
  },
  setDragLimits: function(minX, minY, maxX, maxY){
    this.dragLimits = {
      minX: minX,
      minY: minY,
      maxX: maxX,
      maxY: maxY
    };
  },
  clearDragLimits: function(){
    this.dragLimits = false;
  },
  dragLimits: function(){
    return this.dragLimits;
  },
  intersectRect: function(r1, r2) {
    return !(r2.x > r1.x + r1.width ||
             r2.x + r2.width < r1.x ||
             r2.y > r1.y + r1.height ||
             r2.y + r2.height < r1.y);
  },
  beginDrag: function(event){
    this.dragPos = {x: event.clientX, y: event.clientY};
    this.transSave = {x: this.translation.x, y: this.translation.y};
    this.dragging = false;
  },
  updateDrag: function(event){
    if(this.dragPos){
      if(this.dragging||(Math.abs(this.dragPos.x - event.clientX)>5)||(Math.abs(this.dragPos.y - event.clientY)>5)){
        this.moveViewBy(this.dragPos.x - event.clientX, this.dragPos.y - event.clientY);
        this.dragPos = {x: event.clientX, y: event.clientY};
        this.dragging = true;
      }
    }
  },
  endDrag: function(event){
    this.dragPos = false;
  },

  validateTranslation: function(){
    if(this.dragLimits){
      if((typeof(this.dragLimits.minX)!=='undefined')&&(this.dragLimits.minX!==false)){
        if(this.translation.x<this.dragLimits.minX) this.translation.x = this.dragLimits.minX;
      }
      if((typeof(this.dragLimits.maxX)!=='undefined')&&(this.dragLimits.maxX!==false)){
        if(this.translation.x>this.dragLimits.maxX) this.translation.x = this.dragLimits.maxX;
      }
      if((typeof(this.dragLimits.minY)!=='undefined')&&(this.dragLimits.minY!==false)){
        if(this.translation.y<this.dragLimits.minY) this.translation.y = this.dragLimits.minY;
      }
      if((typeof(this.dragLimits.maxY)!=='undefined')&&(this.dragLimits.maxY!==false)){
        if(this.translation.y>this.dragLimits.maxY) this.translation.y = this.dragLimits.maxY;
      }
    }
  },

  translateMouseCoords: function(e, obj){
    var n, result;
    if(e.offsetX||e.offsetY) return {x: e.offsetX, y: e.offsetY};
    n = obj;
    result = {x: e.pageX, y: e.pageY};
    while(obj&&(!isNaN(obj.offsetLeft))&&(!isNaN(obj.offsetTop))){
      result.x -= obj.offsetLeft;
      result.y -= obj.offsetTop;
      obj = obj.offsetParent;
    }
    return result;
  },

  moveViewBy: function(anX, anY){
    if(this.translation){
      this.translation.x -= parseFloat(anX||0);
      this.translation.y -= parseFloat(anY||0);
    }else this.translation = {x: -parseFloat(anX||0), y: -parseFloat(anY||0)};
    this.validateTranslation();
    this.invalidate();
  },
  moveViewTo: function(anX, anY){
    var tmpX = parseFloat(anX||0);
    if(!isNaN(tmpX)){
      anX = tmpX;
      anY = parseFloat(anY||0);
    }else{
      anY = anY||parseFloat(anX.y||0);
      anX = parseFloat(anX.x||0);
    }
    this.translation = {x: -anX, y: -anY};
    this.validateTranslation();
    this.invalidate();
  },

  beginPath: function(opts){
    this.applyOptions(opts);
    this.context.beginPath();
    if(opts&&opts.alpha) this.context.globalAlpha = opts.alpha;
  },
  closePath: function(opts){
    this.context.closePath();
  },
  applyStrokeFill: function(opts){
    if(opts){
      if((typeof(opts.stroke)!=='undefined'?opts.stroke:ProcessCanvas.defaults.stroke)) this.context.stroke();
      if((typeof(opts.fill)!=='undefined'?opts.fill:ProcessCanvas.defaults.fill)) this.context.fill();
    }else{
      if(ProcessCanvas.defaults.stroke) this.context.stroke();
      if(ProcessCanvas.defaults.fill) this.context.fill();
    }
  },

  drawLine: function(x1, y1, x2, y2, opts){
    this.beginPath(opts);
      this.context.moveTo(x1, y1);
      this.context.lineTo(x2, y2);
    this.closePath(opts);
    this.applyStrokeFill(opts);
  },
  measureText: function(whatText){
    var i, c, width=0, tmp, numLines=1, maxWidth = 0;
    if(whatText instanceof Array){
      for(i = 0; i<whatText.length; i++){
        if(whatText[i].width>maxWidth) maxWidth=whatText[i].width;
      }
      numLines = whatText.length+0.5; // extra 1/2 a line space to fix up a few measuretext issues
    }else for(i = 0; i<whatText.length; i++){
      c=whatText.charAt(i);
      switch(c){
        case('\r'):
          if(width>maxWidth) maxWidth = width;
          width = 0;
          break;
        case('\n'):
          numLines++;
          break;
        default:
          if(!this.charInfo[c]) this.charInfo[c] = this.context.measureText(c).width;
          width+=this.charInfo[c];
      }
    }
    if(!this.charInfo.lineHeight){
      tmp = this.context.measureText('Wy');
      this.charInfo.lineHeight = (typeof(tmp.height)=='undefined')?this.context.measureText('e').width*2:tmp.height;
    }
    return {width: (maxWidth>width)?maxWidth:width, height: this.charInfo.lineHeight*numLines};
  },
  textRect: function(whatText, left, top, width, height, opts){
    var i, x, y, c, leftOffset=0, topOffset=0;
    opts = opts||{};
    this.applyTextOptions(opts);
    x = left;
    y = top;
    switch(opts.textAlign){
      case('center'):
        leftOffset = width / 2;
        break;
      case('right'):
        leftOffset = width;
        break;
    }
    if(whatText instanceof Array){
      for(i = 0; i<whatText.length; i++){
        this.context.fillText(whatText[i].text, x+leftOffset, y+topOffset);
        y += this.charInfo.lineHeight;
      }
    }else for(i = 0; i<whatText.length; i++){
      c = whatText.charAt(i);
      switch(c){
        case('\r'):
          x = left;
          break;
        case('\n'):
          y += this.charInfo.lineHeight;
          break;
        default:
          this.context.fillText(c, x, y);
          x+=this.charInfo[c];
      }
    }
  },
  fillText: function(whatText, left, top, opts){
    var i, x, y, c;
    this.applyTextOptions(opts);
    x = left;
    y = top;
    if(whatText instanceof Array){
      for(i = 0; i<whatText.length; i++){
        this.context.fillText(whatText[i].text, x, y);
        y += this.charInfo.lineHeight;
      }
    }else for(i = 0; i<whatText.length; i++){
      c = whatText.charAt(i);
      switch(c){
        case('\r'):
          x = left;
          break;
        case('\n'):
          y += this.charInfo.lineHeight;
          break;
        default:
          this.context.fillText(c, x, y);
          x+=this.charInfo[c];
      }
    }
  },
  prepareText: function(whatText, opts){
    var text = '', w = 0, h = 0,
        c, pc, // working character and its index
        ls, // index of the line start
        ws, // index of the word start
        tc, // temp char
        lines = new Array(),
        canvas = this,
        nextLine = function(){
          var text = whatText.substring(ls, pc).replace(/\s\s*$/, '');
          lines.push({text: text, length: canvas.context.measureText(text).width});
          w = 0;
        };
    this.applyTextOptions(opts);
    if(!opts.maxWidth) return whatText;
    pc = 0;
    ls = 0;
    ws = ls;
    while(whatText&&(pc<whatText.length)){
      c = whatText.charAt(pc);
      switch(c){
        case('\r'):
          nextLine();
          pc--;
          if(whatText.charAt(pc+2)=='\n') pc+=2;
          else pc++;
          ls=pc+1;
          ws=ls;
          break;
        case('\n'):
          nextLine();
          pc--;
          if(whatText.charAt(pc+2)=='\r') pc+=2;
          else pc++;
          ls=pc+1;
          ws=ls;
          break;
        case(' '):
        case('\t'):
          tc = c;
          while(tc==' '||tc=='\t'){
            tc = whatText.charAt(pc);
            w += this.charInfo[tc];
            pc++;
          }
          if(w>=opts.maxWidth){
            pc = ws-1;
            nextLine();
            ls = pc;
            ws = ls;
          }else{
            ws=pc;
            pc--;
          }
          break;
        default:
          w += this.charInfo[c];
          if(w>=opts.maxWidth){
            if(ws!=ls){
              pc = ws-1;
              nextLine();
              tc = c;
              while(tc==' '||tc=='\t'){
                tc = whatText.charAt(pc);
                pc++;
              }
              ls = pc;
              ws = ls;
            }else{
              pc--;
              nextLine();
              ls=pc;
              ws=ls;
            }
          }
      }
      pc++;
    }
    if(pc!=ls) nextLine();
    return lines;//text;
  },
  drawRect: function(left, top, width, height, opts){
    this.beginPath(opts);
      this.context.rect(left, top, width, height);
    this.closePath(opts);
    this.applyStrokeFill(opts);
  },
  drawRoundRect: function(left, top, width, height, opts){
    var cornerRadius=(opts&&opts.cornerRadius)?opts.cornerRadius:ProcessCanvas.defaults.cornerRadius,
        l = left,
        t = top,
        r = l+width,
        b = t+height,
        x1 = l+cornerRadius,
        x2 = l+width-cornerRadius,
        y1 = t+cornerRadius,
        y2 = t+height-cornerRadius;
    this.beginPath(opts);
      this.context.moveTo(x1, t);
      this.context.lineTo(x2, t);
      this.context.quadraticCurveTo(r, t, r, t+cornerRadius);
      this.context.lineTo(r, y2);
      this.context.quadraticCurveTo(r, b, x2, b);
      this.context.lineTo(x1, b);
      this.context.quadraticCurveTo(l, b, l, y2);
      this.context.lineTo(l, y1);
      this.context.quadraticCurveTo(l, t, x1, t);
    this.closePath(opts);
    this.applyStrokeFill(opts);
  },
  drawEllipse: function(left, top, width, height, opts){
    var kappa = 0.5522848,
        x = left,
        y = top,
        w = width,
        h = height,
        ox = (w / 2) * kappa, // control point offset horizontal
        oy = (h / 2) * kappa, // control point offset vertical
        xe = x + w,           // x-end
        ye = y + h,           // y-end
        xm = x + w / 2,       // x-middle
        ym = y + h / 2;       // y-middle

    this.beginPath(opts);
      this.context.moveTo(x, ym);
      this.context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
      this.context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
      this.context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
      this.context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    this.closePath(opts);
    this.applyStrokeFill(opts);
  },
  drawArc: function(cx, cy, r, sa, ea, opts){
    this.beginPath(opts);
      this.context.arc(cx, cy, r, sa, ea, opts.counterClockwise);
    this.closePath(opts);
    this.applyStrokeFill(opts);
  },

  applyOptions: function(opts, stripPrefix){
    var optName, propName, pfxLen;
    stripPrefix = stripPrefix||'';
    pfxLen = stripPrefix.length;
    for(optName in opts){
      if(pfxLen){
        if(optName.substring(0, pfxLen)!==stripPrefix) continue;
        propName = optName.substring(pfxLen, pfxLen+1).toLowerCase()+optName.substring(pfxLen+1);
      }else propName = optName;
      switch(propName){
        case('fill'):
        case('stroke'):
          break;
        case('font'):
          if(opts[optName]!==this.context[optName]){
            this.scanCharacterSizes();
            this.context[optName] = opts[optName];
          }
          break;
        default:
          if(opts[optName]!==this.context[propName]) this.context[propName] = opts[optName];
      }
    }
  },
  applyDefaultOptions: function(){
    this.applyOptions(ProcessCanvas.defaults);
  },
  scanCharacterSizes: function(){
    var i, c;
    this.charInfo = {};
    this.charInfo.lineHeight = this.measureText('Wy').height;
    for(i = 32; i<255; i++){
      c = String.fromCharCode(i);
      this.charInfo[c] = this.context.measureText(c).width*1.2;
    }
    this.charInfo['\t'] = this.charInfo[' ']*5;
  },
  applyTextOptions: function(opts){
    this.applyOptions(ProcessCanvas.defaults, 'text');
    if(opts) this.applyOptions(opts, 'text');
  },
  rectInView: function(r, vr){
    var x1, y1, x2, y2;
    if(r.source&&r.dest){
      x1 = (r.source.x<r.dest.x)?r.source.x:r.dest.x;
      x2 = (r.source.x<r.dest.x)?r.dest.x:r.source.x;
      y1 = (r.source.y<r.dest.y)?r.source.y:r.dest.y;
      y2 = (r.source.y<r.dest.y)?r.dest.y:r.source.y;
      return this.intersectRect({x: x1, y: y1, width: x2-x1, height: y2-y1}, vr||{x: -this.translation.x, y: -this.translation.y, width: this.width/this.viewScale, height: this.height/this.viewScale});
    }return this.intersectRect(r, vr||{x: -this.translation.x, y: -this.translation.y, width: this.width/this.viewScale, height: this.height/this.viewScale});
  },
  pointInView: function(pt, vr){
    vr = vr||{x1: -this.translation.x, y1: -this.translation.y, x2: -this.translation.x+this.width/this.viewScale, y2: -this.translation.y+this.height/this.viewScale};
    return (pt.x>=vr.x1&&pt.x<=vr.x2&&pt.y>=vr.y1&&pt.y<=vr.y2);
  },
  objInView: function(o){
    return this.rectInView(o, {x: -this.translation.x-200, y: -this.translation.y-200, width: this.width/this.viewScale+400, height: this.height/this.viewScale+400});
  },
  invalidate: function(){
    var self = this;
    if(self.redrawRequested) return;
    self.redrawRequested = true;
    requestAnimationFrame(function(){
      self.redrawRequested = false;
      self.applyDefaultOptions();
      self.context.clearRect( 0, 0, self.width, self.height);
      self.dispatch('beforedraw');
      self.context.save();
      if(self.viewScale!==1) self.context.scale(self.viewScale, self.viewScale);
      self.context.translate(self.translation.x, self.translation.y);
      self.dispatch('draw');
      self.context.restore();
      self.dispatch('afterdraw');
    });
  }
});