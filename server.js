var port = process.env.NODEJS_PORT || 8080;
var ipaddress = process.env.NODEJS_IP || 'localhost';
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
