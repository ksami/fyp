// server
var BinaryServer = require('binaryjs').BinaryServer;
var server = new BinaryServer({port: 9000});
var fs = require('fs');

// New client opened
server.on('connection', function(client){

  // Received something from client
  client.on('stream', function(stream, meta){
    //todo: use meta to do rooming
    console.log('>>>Incoming audio stream');

    // broadcast to all other clients
    for(var id in server.clients){
      if(server.clients.hasOwnProperty(id)){
        var otherClient = server.clients[id];
        if(otherClient != client){
          var send = otherClient.createStream(meta);
          stream.pipe(send);
        } // if (otherClient...
      } // if (binaryserver...
    } // for (var id in ...

    stream.on('end', function() {
      console.log('||| Audio stream ended');
    });
        
  });    //client.on


});