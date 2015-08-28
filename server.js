var express =    require('express');
var path =       require('path');
var http =       require('http');

var port = process.env.PORT || 8080;

var app = express();

// Statically serve public directory
app.use(express.static(path.join(__dirname, 'public')));

var httpServer = http.createServer(app);

httpServer.listen(port);
