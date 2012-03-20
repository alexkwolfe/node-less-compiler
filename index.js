var fs = require('fs'),
    path = require('path'),
    watch = require('watch'),
    less = require('less'),
    events = require('events'),
    util = require('util');
 
var Compiler = function Compiler(options)  {
  events.EventEmitter.call(this);
  options = options || {};
  if (!options.src)
    throw "src option is required";
  this.srcFile = options.src;
  this.srcDir = path.dirname(this.srcFile),
  this.destDir = options.dest || this.srcDir,
  this.destFile = path.join(this.destDir, path.basename(this.srcFile).replace(/\.less$/, '.css')),
  this.watching = false,
  this.compileTimer = null;
};
 
util.inherits(Compiler, events.EventEmitter);

Compiler.prototype.watch = function() {
  if (this.watching) return;
  this.watching = true;
  this.compile();
  var self = this;
  watch.watchTree(this.srcDir, function (f, curr, prev) {
    if (typeof f == "object" && prev === null && curr === null)
      return;
    self.compile();
  });   
};

Compiler.prototype.compile = function() {
  if (this.compileTimer)
    return;
    
  var self = this;
  var doCompile = function(cb) {
    fs.readFile(self.srcFile, 'utf8', function(err, code) {
      if (err) return cb(err);
      doParse(code, cb);
    });
  };
  
  var doParse = function(code, cb) {
    var parser = new(less.Parser)({
      paths: [path.dirname(self.srcFile)],  // search paths for @import directives
      filename: path.basename(self.srcFile) // a filename, for better error messages
    });
    
    parser.parse(code, function (e, tree) {
      if (e) 
        return cb(e);
      try {
        css = tree.toCSS({ compress: true });
        fs.writeFile(self.destFile, css, 'utf8', function(err) {
          if (err) return cb(err);
          cb();
        });
      } catch (e) {
        if (e.filename)
          e.filename = e.filename.replace(self.srcDir + '/', '');
        cb(e);
      }
    });
  };
  
  self.compileTimer = setTimeout(function() {
    doCompile(function(err) {
      if (err) return self.emit('error', err);
      self.emit('compile');
      self.compileTimer = null;
    });
  }, 500);
};

module.exports = function(options) {
  return new Compiler(options);
};