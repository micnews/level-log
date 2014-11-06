
# level-log

## Example

```js
var level = require('level');
var log = require('level-log');

var db = level('db');
var events = log(db);

events.on('op', function(name, args, stream){
  console.log(name, args);
});

db.put('foo', 'bar', function(){
  db.get('foo', function(){});
});

db.createReadStream();
```

## API

### log(db)
