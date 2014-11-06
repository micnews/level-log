
# level-log

  Log all leveldb operations.

## Example

```js
var level = require('level');
var log = require('level-log');

var db = level('db');
var events = log(db);

events.on('op', function(name, args, stream){
  console.log(name, args, !!stream);
  // => "put" ["foo", "bar", function()] false
  // => "get" ["foo", function()] false
  // => "createReadStream" [] true
});

events.on('createReadStream', function(args, stream){
  // ...
});

db.put('foo', 'bar', function(){
  db.get('foo', function(){});
});

db.createReadStream();
```

## Installation

```bash
$ npm install level-log
```

## API

### var events = log(db)
### events.on('op', fn)
### events.on(METHOD, fn)

## License

  MIT
