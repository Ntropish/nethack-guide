var tabletojson = require('tabletojson');
var fs = require('fs');

var html = fs.readFileSync(process.argv[2]);

var tablesAsJson = tabletojson.convert(html);

var rows = [];

function parseTable(table, commandHeader) {
  table.forEach(function(obj){
    rows.push({
      "Command": obj[commandHeader],
      "Name": obj["1"],
      "Description": obj["2"]
    });
  });
};

function parseTableTwoRows(table, commandHeader) {
  table.forEach(function(obj){
    rows.push({
      "Command": obj[commandHeader],
      "Description": obj["1"]
    });
  });
};

parseTable(tablesAsJson[0], "General commands:");
parseTable(tablesAsJson[1], "Game commands:");
parseTableTwoRows(tablesAsJson[2], "Extended Commands (#command)");
parseTable(tablesAsJson[3], "number_pad commands:");
parseTable(tablesAsJson[4], "Meta-key keyboards commands:");

fs.writeFile(process.argv[3], JSON.stringify(rows), function(err){
  if (err) {
    console.log(err);
  }
  console.log('File written');
});
