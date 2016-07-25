ProcessCanvas
==========

ProcessCanvas is a utility library for creating may different types of process flows and graphs.  It wraps up the HTML5 canvas object and provides many useful objects and methods for generating displays.

Status
-------

Right now ProcessCanvas works and works quite well, but it does need a lot of cleanup, documentation, test's written, and etc before it would be easy for the average developer to use it.  Hopefully I will get around to all of that, but until then feel free to look at the examples and the source code.

Browser usage
------------

See the example in examples/basic as a getting started point.

You can also view the basic example at https://rawgit.com/jdarling/ProcessCanvas/master/examples/basic/index.html

CommonJS usage
--------------

Usage with CommonJS (and AMD) is a bit different due to pathing issues that can happen within these loaders.  Below is an example of using ProcessCanvas with CommonJS

```js
const ProcessCanvas = require('../path/to/processcanvas/processCanvas').ProcessCanvas;
require('../path/to/processcanvas/processCanvas.processConnectors')(ProcessCanvas);
require('../path/to/processcanvas/processCanvas.processShapes')(ProcessCanvas);
require('../path/to/processcanvas/processCanvas.viewObjects');
require('../path/to/processcanvas/processCanvas.treeLayout')(ProcessCanvas);
require('../path/to/processcanvas/processCanvas.cuteShapes')(ProcessCanvas);
```
