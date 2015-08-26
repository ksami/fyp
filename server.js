var port = 8080;
var ipaddress = '127.0.0.1';
var _fileindex = __dirname + '/client/index.html';

// Dependencies
var express = require('express');
var app = express();
var http = require('http').Server(app);
app.use(express.static(__dirname + '/client'));

// Listen to <port>
http.listen(port, ipaddress, function(){
    console.log('listening on ' + ipaddress + ':' + port);
});

// Route handler
app.get('/',function(req, res){
    res.sendfile(_fileindex);
});