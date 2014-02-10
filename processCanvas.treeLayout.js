ProcessCanvas.treeLayout = (function(){
  var tree = {
          defaultWidth: 1, defaultHeight: 1, verticalSpacing: 40.5, horizontalSpacing: 7.5, subTreeHorizontalSpacing: 20.5,
          nodeFirstChild: function(node){return nodeFirstChild(node);},
          nodeLastChild: function(node){return nodeLastChild(node);},
          nodeCenter: function(node){return getCenter(node);},
          yDirection: 1, xOffset: 0
        },
      iMaxLevel=0,
      childrenNodeName,
      maxLevelWidths, maxLevelHeights,
      setNeighbors = function(node, level){
        node.left = tree.previousLevelNode[level];
        if(node.left) node.left.right = node;
        tree.previousLevelNode[level] = node;
      },
      nodeFirstChild = function(node){
        if(node[childrenNodeName]&&node[childrenNodeName].length) return node[childrenNodeName].slice(0, 1)[0];
        return null;
      },
      nodeLastChild = function(node){
        if(node[childrenNodeName]&&node[childrenNodeName].length) return node[childrenNodeName].slice(-1)[0];
        return null;
      },
      nodeHeight = function(node){
        if(node.height){
          if(typeof(node.height)=='function') return node.height();
          else return node.height;
        }else return tree.defaultHeight;
      },
      nodeWidth = function(node){
        if(node.width){
          if(typeof(node.width)=='function') return node.width()+tree.horizontalSpacing;
          else return node.width+tree.horizontalSpacing;
        }else return tree.defaultWidth+tree.horizontalSpacing;
      },
      getCenter = function(node){
        var first = nodeFirstChild(node),
            last = nodeLastChild(node);
        return first.prelim + ((last.prelim-first.prelim)+nodeWidth(last)) / 2;
      },
      nodeLeftSibling = function(node){
        if(node.left && node.left.parent==node.parent) return node.left;
        return null;
      },
      leftmost = function(node, level, maxlevel){//node, level){
        var c = (node[childrenNodeName]&&node[childrenNodeName].length)?node[childrenNodeName].length:0,
            i, child,
            left;
        if((typeof(maxlevel)!=='undefined')&&(level >= maxlevel)) return node;
        if(!c) return null;
        for(i in node[childrenNodeName]){
          child = node[childrenNodeName][i];
          left = leftmost(child, level+1);
          if(left) return left;
        }
        return null;
      },
      checkLevelWidth = function(node, level){
        var wid = nodeWidth(node);
        if((!maxLevelWidths[level])||(maxLevelWidths[level]<wid)) maxLevelWidths[level] = wid;
      },
      checkLevelHeight = function(node, level){
        var hei = nodeHeight(node);
        if((!maxLevelHeights[level])||(maxLevelHeights[level]<hei)) maxLevelHeights[level] = hei;
      },
      firstWalk = function(node, level){
        var left = null,
            child,
            i,
            c = (node[childrenNodeName]&&node[childrenNodeName].length)?node[childrenNodeName].length:0,
            mid;
        if(level>iMaxLevel)iMaxLevel = level;
        node.x = 0;
        node.y = 0;
        node.prelim = 0;
        node.mod    = 0;
        node.left   = null;
        node.right  = null;
        node.level  = level;

        checkLevelWidth(node, level);
        checkLevelHeight(node, level);
        setNeighbors(node, level);
        if(c==0){
          left = node.left;
          if(left) node.prelim = left.prelim + nodeWidth(left);
          else node.prelim = 0;
        }else{
          for(i in node[childrenNodeName]){
            child = node[childrenNodeName][i];
            child.parent = node;
            firstWalk(child, level + 1);
          }
          mid = getCenter(node);
          mid -= nodeWidth(node) / 2;
          if(left = node.left){
            node.prelim = left.prelim + nodeWidth(left);//
            node.mod = node.prelim - mid;
            apportion(node, level);
          }else node.prelim = mid;
        }
      },
      secondWalk = function(node, level, x, y){
        var c = (node[childrenNodeName]&&node[childrenNodeName].length)?node[childrenNodeName].length:0,
            right, firstChild;
        node.x = x + node.prelim + tree.xOffset;
        if(tree.yDirection>0) node.y = y;
        else node.y = y+maxLevelHeights[level]-nodeHeight(node);
        if(c){
          if(tree.yDirection>0) secondWalk(node[childrenNodeName].slice(0, 1)[0], level+1, x+node.mod, y+maxLevelHeights[level]+tree.verticalSpacing);
          else secondWalk(firstChild = node[childrenNodeName].slice(0, 1)[0], level+1, x+node.mod, y-maxLevelHeights[level+1]-tree.verticalSpacing);
        }
        if(right = node.right) secondWalk(right, level, x, y);
      },
      apportion = function(node, level){
        var first = nodeFirstChild(node),
            fcLeft = first.left,
            j = 1,
            k, l, gap, modRight, modLeft, right, left, subtree, subCount, subMove, avgGap;
        for(k = iMaxLevel-level; first&&fcLeft&&j<=k;){
          modRight = 0;
          modLeft = 0;
          right = first;
          left = fcLeft;
          for(l=0; l < j; l++){
            right = right.parent;
            left = left.parent;
            modRight += right.mod;
            modLeft += left.mod;
          }
          if((gap = (fcLeft.prelim+modLeft+nodeWidth(fcLeft)+tree.subTreeHorizontalSpacing-tree.horizontalSpacing) - (first.prelim+modRight))&&(gap>0)){
            subtree = node;
            subCount = 0;
            while(subtree && subtree != left){
              subCount++;
              subtree = subtree.left;
            }
            if(subtree){
              subMove = node;
              avgGap = gap / subCount;
              while(subMove != left){
                subMove.prelim += gap;
                subMove.mod += gap;
                gap -= avgGap;
                subMove = subMove.left;
              }
            }
          }
          j++;
          if(!first[childrenNodeName].length) first = leftmost(node, 0, j);
          else first = first[childrenNodeName].slice(0, 1)[0];
          if(first) fcLeft = first.left;
        }
      };
  tree.process = function(data, childNodeName, yDirection){
    tree.yDirection=yDirection||1;
    if(!data) return;
    childrenNodeName = childNodeName || 'children';
    tree.previousLevelNode = new Array();
    maxLevelWidths  = new Array();
    maxLevelHeights = new Array();
    firstWalk(data, 0);
    secondWalk(data, 0, 0, 0);
    maxLevelHeights = new Array();
    return data;
  }
  return tree;
})();