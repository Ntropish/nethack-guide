var fs = require('fs');
var htmlparser = require('htmlparser');

var monsters = [];

var handler = new htmlparser.DefaultHandler(function(error, dom){



  function insertDomain(raw, domain, after) {
    var after = after || 'href="';
    var splitAt = raw.indexOf(after)+after.length;
    return raw.slice(0, splitAt) + domain + raw.slice(splitAt);
  };

  function makeMonster(element, category) {
    var monster = {category: category};
    var name = '';
    var image = '';
    element.children.forEach(function(child){
      // Found monster symbol
      if (child.name === 'span') {
        monster.symbol = '<'+child.raw+'>'+child.children[0].raw+'</span>';
      } else if (child.name === 'a'){

        if (child.attribs.class === 'image') {
          image = '<'+ insertDomain(child.raw, "https://nethackwiki.com") +'>'+'<'+insertDomain(child.children[0].raw, "https://nethackwiki.com", 'src="')+'/></a>'
        } else {
          name = '<'+insertDomain(child.raw, "https://nethackwiki.com")+'>'+child.children[0].raw+'</a>';
        }

      } else if (child.type === 'text') {
        console.log('text:', child);
      } else {
        console.log('?:', child);
      }

    });
    monster.name = name;
    monster.image = image;
    monsters.push(monster);
  };



  if (error) {
    console.log(error);
  } else {
    dom[0].children.forEach(function(child){

      if (child.raw === 'li') {
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        var category = '';
        child.children.forEach(function(gchild){

          // Extract monster category

          if (gchild.name === 'a') {
            console.log(typeof gchild.raw);

            // Insert domain on linke
            var splitAt = gchild.raw.indexOf('href="')+6;
            var modifiedAnchor = '<'+ insertDomain(gchild.raw, "https://nethackwiki.com") +
            '>'+gchild.children[0].raw+'</a>'

            // Add link to category
            category = category + modifiedAnchor;
          } else if (gchild.type === 'text' && gchild.raw !== ', '){

            if (gchild.raw.indexOf(', ') === 0) {
              category = category + gchild.raw.slice(2);
            } else {
              // Add text to category
              category = category + gchild.raw;
            }


          }

          // Monster category is passed, extract monsters
          if (gchild.raw === 'ul') { // Unordered list of monsters
            gchild.children.forEach(function(ggchild){
              if (ggchild.raw === 'li') {
                makeMonster(ggchild, category);
              }
            });
          }

        });
        console.log('=================================');
      }



    });
  }
});

var parser = new htmlparser.Parser(handler);

var html = fs.readFileSync(process.argv[2]);

parser.parseComplete(html);

fs.writeFile(process.argv[3], JSON.stringify(monsters), function(err){
  if (err) {
    console.log(err);
  }
  console.log('File written');
});
