var Memdb = require('memdb');
var Log = require('./');
var sublevel = require('level-sublevel');

var db = sublevel(Memdb());
var sub = db.sublevel('sub');
var events = Log(db);

events.on('op', console.log);

db.put('foo', 'bar', function(){
  db.get('foo', function(){});
});
