var ViewObjectList = function(defaultCanvas){
  var ViewObjectList = this,
      _items = new Array(),
      objectUpdated = function(sender){
        ViewObjectList.dispatch('objectUpdated', sender);
      },
      decoratorLoaded = function(sender){
        var i;
        for(i = 0; i<_items.length; i++){
          _items[i].calcDisplayInfo(defaultCanvas);
        }
      };
  ViewObjectList.events = new ProcessCanvasEvents(ViewObjectList);
  ViewObjectList.add = function(viewObject){
    _items.push(viewObject);
    viewObject.subscribe('onupdated', objectUpdated);
    viewObject.subscribe('decoratorLoaded', decoratorLoaded);
  };
  ViewObjectList.insert = function(viewObject, atIndex){
    if(typeof(atIndex)=='undefined') _items.push(viewObject);
    else _items.splice(atIndex, 0, viewObject);
    viewObject.subscribe('onupdated', objectUpdated);
  };
  ViewObjectList.remove = function(viewObject){
    var idx = _items.indexOf(viewObject);
    if(idx==-1) idx = viewObject;
    _items[idx].unsubscribe('onupdated', objectUpdated);
    _items[idx].subscribe('decoratorLoaded', decoratorLoaded);
    _items.splice(idx, 1);
  };
  ViewObjectList.indexOf = function(viewObject){
    return _items.indexOf(viewObject);
  };
  ViewObjectList.draw = function(to){
    var i;
    for(i = 0; i<_items.length; i++){
      if((_items[i].visible&&to.objInView(_items[i]))||(_items[i].recalcDisplay)) _items[i].draw(to);
    }
  };
  ViewObjectList.findBy = function(fieldName, fieldValue){
    var i, result = [];
    for(i = 0; i<_items.length; i++){
      if((typeof(_items[i][fieldName])!=='undefined')&&(_items[i][fieldName]==fieldValue)) result.push(_items[i]);//return _items[i];
    }
    return (result.length>0)?result:false;
  };
  ViewObjectList.hitTest = function(worldX, worldY){
    var i;
    for(i = 0; i<_items.length; i++){
      if(_items[i].visible&&_items[i].hitTest(worldX, worldY)) return _items[i];
    }
    return false;
  };
  ViewObjectList.object = function(index){
    return (index>=0)?_items[index]:_items[_items.length+index];
  };
  ViewObjectList.first = function(){
    return _items[0];
  };
  ViewObjectList.last = function(){
    return _items[_items.length-1];
  };
  ViewObjectList.count = function(){
    return _items.length;
  };

  ViewObjectList.subscribe = function(eventName, callback){
    this.events.subscribe(eventName, callback);
  };
  ViewObjectList.unsubscribe = function(eventName, callback){
    this.events.unsubscribe(eventName, callback);
  };
  ViewObjectList.dispatch = function(eventName, data){
    return this.events.dispatch(eventName, data||{});
  };

  ViewObjectList.subscribe('decoratorLoaded', decoratorLoaded);
  ViewObjectList.clear = function(){
    var i = ViewObjectList.count()-1;
    while(i>=0){
      ViewObjectList.remove(i);
      i--;
    }
  };
  return ViewObjectList;
},

ViewObject = function(){
  var viewObject = this, _custom_events = new Array();
  viewObject.raw_caption = 'New Object';
  viewObject.textPaddingLeft = 5;
  viewObject.textPaddingTop = 5;
  viewObject.textPaddingRight = 5;
  viewObject.textPaddingBottom = 5;
  viewObject.recalcDisplay = true;
  viewObject.width = 150;
  viewObject.defaultDecoratorWidth = 24;
  viewObject.defaultDecoratorHeight = 24;
  viewObject.x = 0;
  viewObject.y = 0;
  viewObject.displayOptions = {};
  viewObject.visible = true;
  viewObject.source = viewObject.dest = false;
  viewObject.events = new ProcessCanvasEvents(viewObject);
  viewObject.decorator = {
    img: false,
    placement: 'bottom',
    x: 0, y: 0
  };
  viewObject.textOffsets = {
    drawCloud: {left: 0.15, top: 0.4, right: 0.20, bottom: 0.30},
    drawExternalProcess: {left: 10, top: 4, right: 10, bottom: 4},
    drawRoundedExternalProcess: {left: 10, top: 4, right: 10, bottom: 4},
    drawDatabase: {left: 5, top: 22, right: 10, bottom: 4},
    drawExternalData: {left: 20, top: 4, right: 25, bottom: 4},
    drawDocument: {left: 8, top: 4, right: 8, bottom: 30},
    defaults: {left: 8, top: 4, right: 8, bottom: 4}
  };

  function calcZeroToOne(aValue, mulVal){
    return (aValue>0&&aValue<=1)?aValue*mulVal:aValue;
  }

  viewObject.subscribe = function(eventName, callback){
    this.events.subscribe(eventName, callback);
  };
  viewObject.unsubscribe = function(eventName, callback){
    this.events.unsubscribe(eventName, callback);
  };
  viewObject.dispatch = function(eventName, data){
    return this.events.dispatch(eventName, data||{});
  };

  viewObject.decorator.setImage = function(to){
    var img;
    viewObject.decorator.img = false;
    viewObject.decorator.isloaded = false;
    viewObject.recalcDisplay = true;
    if(to){
      if(to instanceof Image){
        viewObject.decorator.img = to;
        viewObject.dispatch('decoratorSet', to);//decorator.loaded.dispatch(this, img);
        viewObject.dispatch('onupdated');
      }else{
        img = new Image();
        img.src = to;
        img.onload = function(){
          viewObject.decorator.img = img;
          viewObject.recalcDisplay = true;
          viewObject.dispatch('decoratorLoaded', img);//decorator.loaded.dispatch(this, img);
          viewObject.dispatch('decoratorSet', to);//decorator.loaded.dispatch(this, img);
          viewObject.dispatch('onupdated');
        };
      }
    }
  };
  viewObject.decorator.setPlacement = function(to){
    viewObject.decorator.placement = to;
    viewObject.recalcDisplay = true;
  };
  viewObject.calcDecoratorPosition = function(){
    var hasDecorator = (typeof(viewObject.decorator.img)!=='undefined')&&(viewObject.decorator.img instanceof Image),
        decoratorPlacement = hasDecorator?viewObject.decorator.placement.toLowerCase():'',
        decoratorOffsets = {left: 0, top: 0, right: 0, bottom: 0};
    if(hasDecorator){
      viewObject.decorator.x = (viewObject.width/2)-(viewObject.decorator.img.width/2);
      viewObject.decorator.y = (viewObject.height/2)-(viewObject.decorator.img.height/2);
      switch(decoratorPlacement){
        case('top left'):
          viewObject.decorator.x = viewObject.textPaddingLeft;
          viewObject.textPaddingLeft += viewObject.decorator.img.width;
          viewObject.decorator.y = viewObject.textPaddingTop;
          break;
        case('bottom left'):
          viewObject.decorator.x = viewObject.textPaddingLeft;
          viewObject.textPaddingLeft += viewObject.decorator.img.width;
          viewObject.decorator.y = viewObject.height-viewObject.textPaddingBottom-viewObject.decorator.img.height;
          break;
        case('left'):
          viewObject.decorator.x = viewObject.textPaddingLeft;
          viewObject.textPaddingLeft += viewObject.decorator.img.width;
          break;
        case('top right'):
          viewObject.decorator.y = viewObject.textPaddingTop;
          viewObject.decorator.x = viewObject.width-viewObject.decorator.img.width-viewObject.textPaddingRight;
          viewObject.textPaddingRight += viewObject.decorator.img.width;
          break;
        case('bottom right'):
          viewObject.decorator.y = viewObject.height-viewObject.textPaddingBottom-viewObject.decorator.img.height;
          viewObject.decorator.x = viewObject.width-viewObject.decorator.img.width-viewObject.textPaddingRight;
          viewObject.textPaddingRight += viewObject.decorator.img.width;
          break;
        case('right'):
          viewObject.decorator.x = viewObject.width-viewObject.decorator.img.width-viewObject.textPaddingRight;
          viewObject.textPaddingRight += viewObject.decorator.img.width;
          break;
        case('top'):
          viewObject.decorator.y = viewObject.textPaddingTop;
          viewObject.textPaddingTop += viewObject.decorator.img.height;
          break;
        case('bottom'):
          viewObject.decorator.y = viewObject.height-viewObject.textPaddingBottom-viewObject.decorator.img.height;
          viewObject.textPaddingBottom += viewObject.decorator.img.height;
          break;
      }
      viewObject.decorator.isloaded = true;
    }else viewObject.decorator.isloaded = false;
  };
  viewObject.calcDisplayInfo = function(canvas){
    var hasDecorator = (typeof(viewObject.decorator.img)!=='undefined')&&(viewObject.decorator.img instanceof Image),
        decoratorPlacement = hasDecorator?viewObject.decorator.placement.toLowerCase():'',
        decoratorOffsets = {left: 0, top: 0, right: 0, bottom: 0};
    viewObject.setDrawable(viewObject.displayProc);
    if(hasDecorator){
      switch(decoratorPlacement){
        case('left'):
        case('top left'):
        case('bottom left'):
          decoratorOffsets.left = viewObject.decorator.img.width||viewObject.defaultDecoratorWidth;
          break;
        case('right'):
        case('top right'):
        case('bottom right'):
          decoratorOffsets.right = viewObject.decorator.img.width||viewObject.defaultDecoratorWidth;
          break;
        case('top'):
          decoratorOffsets.top = viewObject.decorator.img.height||viewObject.defaultDecoratorHeight;
          break;
        case('bottom'):
          decoratorOffsets.bottom = viewObject.decorator.img.height||viewObject.defaultDecoratorHeight;
          break;
      }
    }

    viewObject.textPaddingLeft = calcZeroToOne(viewObject.textPaddingLeft, viewObject.width);
    viewObject.textPaddingRight = calcZeroToOne(viewObject.textPaddingRight, viewObject.width);
    viewObject.caption = canvas.prepareText(viewObject.raw_caption, {maxWidth: viewObject.width-viewObject.textPaddingLeft-viewObject.textPaddingRight-decoratorOffsets.right-decoratorOffsets.left});
    viewObject.internalHeight = canvas.measureText(viewObject.caption).height+decoratorOffsets.top+decoratorOffsets.bottom;
    viewObject.textPaddingTop = calcZeroToOne(viewObject.textPaddingTop, viewObject.internalHeight)
    viewObject.textPaddingBottom = calcZeroToOne(viewObject.textPaddingBottom, viewObject.internalHeight);
    viewObject.height = viewObject.internalHeight+viewObject.textPaddingTop+viewObject.textPaddingBottom;

    viewObject.calcDecoratorPosition();

    viewObject.internalWidth = viewObject.width-viewObject.textPaddingLeft-viewObject.textPaddingRight;
    viewObject.recalcDisplay = false;
  };
  viewObject.setSource = function(to){
    viewObject.source = to;
    viewObject.updated();
  };
  viewObject.setDest = function(to){
    viewObject.dest = to;
    viewObject.updated();
  };
  viewObject.draw = function(to){
    if(!viewObject.displayProc) return;
    viewObject.dispatch('beforeDraw', {targetCanvas: to});
    if(viewObject.recalcDisplay) viewObject.calcDisplayInfo(to);
    if(viewObject.source&&viewObject.dest) to[viewObject.displayProc](
        viewObject.source.x+viewObject.source.width/2,
        viewObject.source.y+viewObject.source.height/2,
        viewObject.dest.x+viewObject.dest.width/2,
        viewObject.dest.y+viewObject.dest.height/2,
        {
          offsetX1: viewObject.source.width/2,
          offsetY1: viewObject.source.height/2,
          offsetX2: viewObject.dest.width/2,
          offsetY2: viewObject.dest.height/2,
          startStyle: viewObject.displayOptions.startStyle,
          endStyle: viewObject.displayOptions.endStyle
        });
    else to[viewObject.displayProc](viewObject.x, viewObject.y, viewObject.width, viewObject.height, viewObject.displayOptions);
    to.textRect(viewObject.caption, viewObject.x+viewObject.textPaddingLeft, viewObject.y+viewObject.textPaddingTop, viewObject.internalWidth, viewObject.internalHeight, viewObject.displayOptions);
    if(viewObject.decorator.isloaded) to.context.drawImage(viewObject.decorator.img, viewObject.x+viewObject.decorator.x, viewObject.y+viewObject.decorator.y);
    viewObject.dispatch('afterDraw', {targetCanvas: to});
  };
  viewObject.setCaption = function(to){
    viewObject.raw_caption = to;
    viewObject.updated();
  };
  viewObject.setDrawable = function(procName){
    viewObject.displayProc = procName;
    if(viewObject.textOffsets[procName]){
      viewObject.textPaddingLeft    = calcZeroToOne(viewObject.textOffsets[procName].left, this.width);
      viewObject.textPaddingRight   = calcZeroToOne(viewObject.textOffsets[procName].right, this.width);
      viewObject.textPaddingTop     = viewObject.textOffsets[procName].top;
      viewObject.textPaddingBottom  = viewObject.textOffsets[procName].bottom;
    }else{
      viewObject.textPaddingLeft = viewObject.textOffsets.defaults.left;
      viewObject.textPaddingTop = viewObject.textOffsets.defaults.top;
      viewObject.textPaddingRight = viewObject.textOffsets.defaults.right;
      viewObject.textPaddingBottom = viewObject.textOffsets.defaults.bottom;
    }
    viewObject.updated();
  };
  viewObject.moveTo = function(anX, anY){
    viewObject.x = anX;
    viewObject.y = anY;
    viewObject.updated(false);
  };
  viewObject.setSize = function(toWidth){
    viewObject.width = toWidth;
    viewObject.updated();
  };
  viewObject.hitTest = function(x, y){
    return x>viewObject.x&&x<viewObject.x+viewObject.width&&y>viewObject.y&&y<viewObject.y+viewObject.height;
  };
  viewObject.updated = function(forceRecalc){
    if(forceRecalc!==false) viewObject.recalcDisplay = true;
    viewObject.dispatch('onupdated');
  };
  viewObject.setDrawable('drawRoundedProcess');
  return viewObject;
};