var EventEmitter = require('events').EventEmitter;
var createManifest = require('level-manifest');
var slice = [].slice;
var fwd = require('forward-events');
var through2 = require('through2');

module.exports = monitor;

function trackCallback(args, fn) {
  var cb = args.length > 0 ? args[args.length - 1] : null;

  if ('function' !== typeof cb) {
    args.push(fn);
    return;
  }

  args[args.length - 1] = function() {
    fn.apply(this, arguments);
    return cb.apply(this, arguments);
  };
}

function monitor(db, opts){
  opts = opts || {};
  var events = new EventEmitter();
  var m = createManifest(db);
  if (m.methods) Object.keys(m.methods).forEach(function(name){
    var type = m.methods[name].type;
    var orig = db[name];
    db[name] = function(){
      var args = slice.call(arguments);
      var startTime = new Date();

      var isStream = ['readable', 'writable', 'stream'].indexOf(type) > -1;
      if (isStream){
        var chunksCount = 0;
        var firstChunkTime = Infinity;

        stream = orig.apply(db, arguments);
        var s = stream.pipe(through2.obj(function(chunk, enc, callback) {
          this.push(chunk);
          if (Infinity === firstChunkTime) {
            firstChunkTime = new Date() - startTime;
          }
          ++chunksCount;
          callback();
        }, function(callback) {
          var totalTime = new Date() - startTime;
          var results = {
            name: name,
            args: args,
            chunksCount: chunksCount,
            firstChunkTime: firstChunkTime,
            totalTime: totalTime
          };
          events.emit('op-finish', results);
          events.emit(name + '-finish', results);
          callback();
        }));

        events.emit('op', name, args, s);
        events.emit(name, args, s);
        return s;
      } else {
        trackCallback(args, function() {
          var totalTime = new Date() - startTime;
          var results = {
            name: name,
            args: args,
            chunksCount: 1,
            firstChunkTime: totalTime,
            totalTime: totalTime
          };
          events.emit('op-finish', results);
          events.emit(name + '-finish', results);
        });

        events.emit('op', name, args);
        events.emit(name, args);
        return orig.apply(db, args);
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


