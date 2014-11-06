var Memdb = require('memdb');
var Log = require('./');
var sublevel = require('level-sublevel');

var db = sublevel(Memdb());
var sub = db.sublevel('sub');
var events = Log(db);

events.on('op', function(name, args, stream){
  console.log('%s(%s) stream: %s', name, args.map(JSON.stringify).filter(Boolean).join(', '), !!stream);
});

db.put('foo', 'bar', function(){
  db.get('foo', function(){});
});

db.createReadStream();
