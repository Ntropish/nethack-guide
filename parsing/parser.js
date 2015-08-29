var tabletojson = require('tabletojson');
var fs = require('fs');

var html = fs.readFileSync(process.argv[2]);

var tablesAsJson = tabletojson.convert(html);

var json = tablesAsJson[process.argv[4]];

fs.writeFile(process.argv[3], JSON.stringify(json), function(err){
  if (err) {
    console.log(err);
  }
  console.log('File written');
});
