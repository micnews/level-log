var test = require('tape');
var level = require('memdb');
var log = require('./');
var sub = require('level-sublevel');

test('simple', function(t){
  t.plan(5);
  var db = level();
  var events = log(db);
  events.on('op', function(name, args){
    t.equal(name, 'get');
    t.equal(args[0], 'foo');
    t.equal(typeof args[1], 'function');
  });
  events.on('get', function(args){
    t.equal(args[0], 'foo');
    t.equal(typeof args[1], 'function');
  });
  db.get('foo', function(){});
});

test('streams', function(t){
  t.plan(2);
  var db = level();
  var events = log(db);
  events.on('op', function(name, args, stream){
    if (name == 'isOpen') return;
    t.ok(stream);
  });
  events.on('createReadStream', function(args, stream){
    t.ok(stream);
  });
  db.createReadStream();
});

test('sublevel', function(t){
  t.plan(3);
  var db = sub(level());
  db.sublevel('sub');
  var events = log(db, { sublevel: true });
  events.on('op', function(name, args){
    t.equal(name, 'get');
    t.equal(args[0], 'foo');
    t.equal(typeof args[1], 'function');
  });
  db.sublevel('sub').get('foo', function(){});
});

test('sublevel nested', function(t){
  t.plan(3);
  var db = sub(level());
  db.sublevel('sub').sublevel('sub');
  var events = log(db, { sublevel: true });
  events.on('op', function(name, args){
    t.equal(name, 'get');
    t.equal(args[0], 'foo');
    t.equal(typeof args[1], 'function');
  });
  db.sublevel('sub').sublevel('sub').get('foo', function(){});
});
