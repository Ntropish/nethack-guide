var fs = require('fs');
var https= require('https');



var json = fs.readFileSync('monsters.json');

var monsters = JSON.parse(json);

var pages = {};

var l = monsters.length;
var i = 0;
function getTable(index) {
  var url = monsters[index].name.split('"')[1];

  console.log(url);

  https.get(url, function(resp){
    resp.on('data', function(chunk){
      if (pages[monsters[index].name]) {
        pages[monsters[index].name] += chunk.toString();
      } else {
        pages[monsters[index].name] = chunk.toString();
      }
    });
  });

  i++;
  if (i<l) {
    setTimeout(function(){
      getTable(i);
    }, 200);
  } else {
    setTimeout(function(){
      fs.writeFile('monster-pages.json', JSON.stringify(pages, null, 2), function(err){
        if (err) {
          console.log(err);
        }
        console.log('File written');
      });
    }, 1000);
  }
}
getTable(0);
