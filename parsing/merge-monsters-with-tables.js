var fs = require('fs');
var cheerio = require('cheerio');

var monsters = JSON.parse(fs.readFileSync('monsters.json'));
var pages = JSON.parse(fs.readFileSync('monster-pages.json'));

monsters.forEach(function(monster, index){
  var page = pages[monster.name];

  var $ = cheerio.load(page);

  var tables = $('table');

  var tableString = '<table>'+$(tables["1"]).html()+'</table>'

  monster.table = tableString;

});
fs.writeFile('monsters-with-tables.json', JSON.stringify(monsters, null, 2), function(err){
  if (err) {
    console.log(err);
  }
  console.log('written');
});
