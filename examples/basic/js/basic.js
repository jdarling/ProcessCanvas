var canvas = document.getElementById('testCanvas');
var viewer = ProcessCanvas.init(canvas);
var scene = new ViewObjectList(viewer);

/*
NOTE:
  This example will crash your browser if you add circular references in the connections section.  So, don't do it.
*/

// Just some test data
var testData = {
  nodes: [
    {
      id: 1,
      name: 'Item 1'
    },
    {
      id: 2,
      name: 'Item 2',
      shape: 'cloud' // Draw a cloud
    },
    {
      id: 3,
      name: 'Item 3',
      shape: 'invalid shape' // Invalid shape isn't registered, so draw normal "box" shape
    },
    {
      id: 4,
      name: 'Item 4'
    }
  ],
  connections: [
    {
      from: 1,
      to: 2
    },
    {
      from: 1,
      to: 4
    },
    {
      from: 3,
      to: 1
    }
  ]
};

// Creates a directed connection from one node to another
var buildConnection = function(from, to, scene){
  var connection = new ViewObject();
  connection.setCaption('');
  connection.setSource(from);
  connection.setDest(to);
  connection.setDrawable('drawVerticalConnection');
  connection.displayOptions.startStyle = 'ball';
  connection.displayOptions.endStyle = 'arrow';
  scene.add(connection);
  return connection;
};

// Centers a specific node or the viewer.root in the center of the viewer
var recenterViewTree = function(nodes){
  var tree = nodes || viewer.root,
      upLeftMost = tree.inbound&&tree.inbound.length>0?tree.inbound[0].x:false,
      upRightMost= tree.inbound&&tree.inbound.length>0?tree.inbound[tree.inbound.length-1].x:false,
      downLeftMost = tree.outbound&&tree.outbound.length>0?tree.outbound[0].x:false,
      downRightMost= tree.outbound&&tree.outbound.length>0?tree.outbound[tree.outbound.length-1].x:false
      upCenterOffset = (upRightMost-upLeftMost)/2,
      downCenterOffset = (downRightMost-downLeftMost)/2,
    offsetChildren = function(root, moveBy, direction){
      if(Math.round(moveBy)==0) return;
      if(root[direction]&&root[direction].length>0) for(var i in root[direction]){
        root[direction][i].x+=moveBy;
        offsetChildren(root[direction][i], moveBy, direction);
      }
    };
  offsetChildren(tree, tree.x-(upLeftMost+upCenterOffset), 'inbound');
  offsetChildren(tree, tree.x-(downLeftMost+downCenterOffset), 'outbound');
  viewer.moveViewTo(tree.x-(viewer.width/2)+(tree.width/2), tree.y-(viewer.height/2)+(tree.height/2));
};

var toCamelCase = function(str){
  // Lower cases the string
  return str.toLowerCase()
    // Replaces any - or _ characters with a space
    .replace( /[-_]+/g, ' ')
    // Removes any non alphanumeric characters
    .replace( /[^\w\s]/g, '')
    // Uppercases the first character in each group immediately following a space
    // (delimited by spaces)
    .replace( / (.)/g, function($1) { return $1.toUpperCase(); })
    // Removes spaces
    .replace( / /g, '' );
};

var getNodeShape = function(node){
  if(node && node.shape){
    var shapeName = toCamelCase('draw '+node.shape);
    return ProcessCanvas[shapeName]?shapeName:'drawProcess';
  }
  return 'drawProcess';
};

// Walks all of the data and creates view objects and their connections based on the data
var walkData = function(root, scene, builderCanvas, direction){
  var vObject = new ViewObject(), tmp;
  var shape = getNodeShape(root);
  vObject.setCaption(root.name||root.id);
  vObject.setSize(100);
  vObject.setDrawable(shape);//root.displayshape||'drawProcess');
  vObject.id = root.id;
  vObject.displayOptions.textAlign = 'center';
  if(root.decorator){
    vObject.decorator.setPlacement('bottom');
    vObject.decorator.setImage(decoratorImagesList.getImage(root.decorator, function(){
      setTimeout(scene.invalidateView, 100);
      scene.dispatch('decoratorLoaded');
    }));
  }
  vObject.inbound = new Array();
  vObject.outbound = new Array();
  vObject.calcDisplayInfo(builderCanvas);
  scene.add(vObject);
  if(root.inbound instanceof Array && ((!direction) || (direction === 'inbound'))){
    for(var id in root.inbound){
      tmp = walkData(root.inbound[id], scene, builderCanvas, 'inbound');
      vObject.inbound.push(tmp);
      buildConnection(vObject, tmp, scene);
    }
  }
  if(root.outbound instanceof Array && ((!direction) || (direction === 'outbound'))){
    for(var id in root.outbound){
      tmp = walkData(root.outbound[id], scene, builderCanvas, 'outbound');
      vObject.outbound.push(tmp);
      buildConnection(vObject, tmp, scene);
    }
  }
  return vObject;
};

// Convience function to resize the viewer to the window size
viewer.resizeToFit = function(){
  var sizedWindowWidth = viewer.parentNode.offsetWidth,
      sizedWindowHeight = viewer.parentNode.offsetHeight;
  viewer.width = sizedWindowWidth;
  viewer.height = sizedWindowHeight;
  viewer.invalidate();
};

// Takes the raw testData and converts it into a graph for use with walkData
var linkData = function(){
  var sceneObjects = new Array(testData.nodes.length),
      i, l = testData.nodes.length, fromIdx, toIdx, connection,
      indexes = new Array(testData.nodes.length);

  for(i=0; i<l; i++){
    sceneObjects[i] = testData.nodes[i];
    sceneObjects[i].inbound = sceneObjects[i].inbound || [];
    sceneObjects[i].outbound = sceneObjects[i].outbound || [];
    indexes[i] = sceneObjects[i].id;
  }

  l = testData.connections.length;
  for(i=0; i<l; i++){
    connection = testData.connections[i];
    fromIdx = indexes.indexOf(connection.from);
    toIdx = indexes.indexOf(connection.to);
    sceneObjects[fromIdx].outbound.push(sceneObjects[toIdx]);
    sceneObjects[toIdx].inbound.push(sceneObjects[fromIdx]);
  }

  return sceneObjects;
};

var init = function(){
  var sceneObjects = linkData();

  var root = viewer.root = walkData(sceneObjects[0], scene, viewer);

  ProcessCanvas.treeLayout.process(root, 'outbound');
  ProcessCanvas.treeLayout.process(root, 'inbound', -1);

  // Setup drawing the scene when the viewer does a draw
  viewer.subscribe('draw', function(context, event){
    this.applyDefaultOptions();
    scene.draw(this);
  });

  // Handler to allow selection of objects from the scene
  viewer.select = function (what, focusOn){
    var i;
    if(viewer.selection){
      if(viewer.selection.length) for(i in viewer.selection){
        viewer.selection[i].displayOptions.endColor = '#dce0e9';
      }else{
        viewer.selection.displayOptions.endColor = '#dce0e9';
      }
    }
    viewer.selection = what;
    if(viewer.selection){
      if(focusOn){
        if((focusOn.inbound.length>0)&&(focusOn.outbound.length>0)) viewer.moveViewTo(focusOn.x-(viewer.width/2)+(focusOn.width/2), focusOn.y-(viewer.height/2)+(focusOn.height/2));
        else if(focusOn.outbound.length>0) viewer.moveViewTo(focusOn.x-(viewer.width/2)+(focusOn.width/2), -30);
        else viewer.moveViewTo(focusOn.x-(viewer.width/2)+(focusOn.width/2), -viewer.height+focusOn.height+focusOn.height+30);
      }
      if(viewer.selection.length) for(i in viewer.selection){
        viewer.selection[i].displayOptions.endColor = 'yellow';
      }else{
        viewer.selection.displayOptions.endColor = 'yellow';
      }
    }
    viewer.invalidate();
  };

  // Some generic mouse handling functions
  /*
  These don't work for touch yet, need to make some changes to ProcessCanvas.beginDrag etc... to support it
  see https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Touch_events?redirectlocale=en-US&redirectslug=Web%2FGuide%2FAPI%2FDOM%2FEvents%2FTouch_events#Example
  */
  var handleDown = function(e){
    var selObj, coords;
    e = e||window.event;
    coords = viewer.translateMouseCoords(e, this);
    viewer.select(scene.hitTest(coords.x-this.translation.x, coords.y-this.translation.y));
    /*
    if(selObj = scene.hitTest(coords.x-this.translation.x, coords.y-this.translation.y)){
      viewer.select(scene.findBy('id', selObj.id));
    }
    */
    this.beginDrag(e);
    e.preventDefault();
    return false;
  };
  var handleMove = function(e){
    this.updateDrag(e);
    e.preventDefault();
    return false;
  };
  var handleUp = function(e){
    this.endDrag(e);
    e.preventDefault();
    return false;
  };

  viewer.subscribe('touchbegin', handleDown);
  viewer.subscribe('touchmove', handleMove);
  viewer.subscribe('touchend', handleUp);

  viewer.subscribe('mousedown', handleDown);
  viewer.subscribe('mousemove', handleMove);
  viewer.subscribe('mouseup', handleUp);

  viewer.resizeToFit();
  //viewer.select(root);
  recenterViewTree(root);
};

var listenFor = window.addEventListener?function(target, eventName, callback, useCapture){ // Firefox, Chrome, Opera
  target.addEventListener(eventName, callback, useCapture||false);
}:function(target, eventName, callback){ // IE Only
  target.attachEvent('on'+eventName, callback);
};

listenFor(window, 'load', init);
