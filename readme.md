Watches a directory of LESS files for changes, and compiles to CSS when a change is made.

## Usage

```javascript
var lessCompiler = require('less-compiler');
var lessPath = '/path/to/less/files';
var cssPath = '/path/to/css/files';

// set up the compiler
var compiler = lessCompiler({
  src: path.join(lessPath, 'style.less'), // the less file with all your imports
  dest: cssPath                           // the directory where all your compiled CSS files go
});
compiler.on('compile', function() {
  console.log("recompiled LESS assets");
});
compiler.on('error', function(err) {
  console.log("could not compile LESS assets: " + err);
});

// watch the parent directory of the src file
compiler.watch(); 
```