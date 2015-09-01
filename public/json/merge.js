var fs = require('fs');

// This file merges editable-data.json and row files into a single data.json
// For the application to load

var data = JSON.parse(fs.readFileSync('editable-data.json'));

for (key in data) {
  var rows = JSON.parse(fs.readFileSync(key+'.json'));
  data[key].rows = rows;
}

fs.writeFile('data.json', JSON.stringify(data), function(err){
  if (err) {
    console.log(err);
  }
  console.log('written');
});
