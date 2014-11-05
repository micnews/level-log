var EventEmitter = require('events').EventEmitter;
var createManifest = require('level-manifest');
var slice = [].slice;

module.exports = monitor;

function monitor(db){
  var events = new EventEmitter();
  var m = createManifest(db);
  if (m.methods) Object.keys(m.methods).forEach(function(name){
    var type = m.methods[name];
    var orig = db[name];
    db[name] = function(){
      var args = slice.call(arguments);
      events.emit('op', name, args);
      events.emit(name, args);

      return orig.apply(db, arguments);
    };
  });
  return events;
}


