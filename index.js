var EventEmitter = require('events').EventEmitter;
var createManifest = require('level-manifest');
var slice = [].slice;
var fwd = require('forward-events');

module.exports = monitor;

function monitor(db, opts){
  opts = opts || {};
  var events = new EventEmitter();
  var m = createManifest(db);
  if (m.methods) Object.keys(m.methods).forEach(function(name){
    var type = m.methods[name].type;
    var orig = db[name];
    db[name] = function(){
      var args = slice.call(arguments);
      var isStream = ['readable', 'writable', 'stream'].indexOf(type) > -1;
      if (isStream){
        stream = orig.apply(db, arguments);
        events.emit('op', name, args, stream);
        events.emit(name, args, stream);
        return stream;
      } else {
        events.emit('op', name, args);
        events.emit(name, args);
        return orig.apply(db, arguments);
      }
    };
  });
  if (m.sublevels && opts.sublevel) {
    Object.keys(m.sublevels).forEach(function(name){
      var sub = monitor(db.sublevel(name), { sublevel: name });
      fwd(sub, events);
    });
  }
  return events;
}


