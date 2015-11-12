var crypto  = require('crypto');
var through = require('through2');
var fs      = require("fs");

var plugin   =  function(name, dependencies){

  // Run for each pipe (once)
  if (!plugin.dependencyPrev[name]) {
    plugin.dependencyPrev[name] = {};
  }

  plugin.dependencyCache[name] = JSON.parse( JSON.stringify( plugin.dependencyPrev[name] ) );

  var changed = false;

   dependencies.forEach( function(dependency){      
    var contents = fs.readFileSync(dependency, "utf8").toString('utf8');
    var hash     = crypto.createHash('md5').update(contents).digest('hex');
    var key      = crypto.createHash('md5').update(dependency).digest('hex');
    var dependencyFile = plugin.dependencyCache[name][key];

    // hit - ignore it
    if (typeof dependencyFile !== 'undefined' && dependencyFile === hash) {
      return;
    }

    changed = true;
    plugin.dependencyPrev[name][key] = hash;
  });

  // Run for each file
  var stream = through.obj(function(file, enc, callback){

    if( changed === true ){
      this.push(file);
      callback();      
    }else{
      callback();
      return;
    }

  });

  return stream;
};

plugin.dependencyPrev   = {};
plugin.dependencyCache  = {};

module.exports = plugin;



