////////////
// Server //
////////////

require('dotenv').load();
var socketio = require('socket.io');
var binaryserver = require('binaryjs').BinaryServer;
var keystone = require('keystone');
var mongoose = require('mongoose');
var _ = require('underscore');
keystone.set('mongoose', mongoose);
var debugsocket = require('debug')('vPoster:socket');
var debugbs = require('debug')('vPoster:binaryjs');
var debugdb = require('debug')('vPoster:db');
var debug = require('debug')('vPoster:info');

keystone.init({

    'name': 'vPoster',
    'brand': 'vPoster',
    
    'favicon': 'public/favicon.ico',
    'static': 'public',
    
    'views': 'templates/views',
    'view engine': 'jade',
    
    'auto update': true,
    'mongo': process.env.SERVER_MONGO_CONN,
    
    'session': true,
    'auth': true,
    'user model': 'User',
    'cookie secret': process.env.COOKIE_SECRET
  
});

require('./models');

keystone.set('routes', require('./routes'));

//after sign-in, where are they redirected to?
keystone.set('signin redirect', function(user, req, res){
    var url = '';
    if (user.canAccessKeystone || user.isAdmin){
        url = '/keystone';
    }
    else if(user.isOrganiser){
        url = '/createEvent';
    }
    else if(user.isParticipant){
        url = '/dashboard';
    }
    else if(user.isPublic){
        url = '/';
    }
    res.redirect(url);
});

// Configure the navigation bar in Keystone's Admin UI
keystone.set('nav', {
    'events': 'events',
    'users': 'users'
});

keystone.start({
    onHttpServerCreated: function(){
        keystone.set('io', socketio.listen(keystone.httpServer));
        keystone.set('bs', new binaryserver({
            server: keystone.httpServer,
            path: '/binary-endpoint'
        }));
    },

    onStart: function(){
        //establish BinaryJS connection
        var bs = keystone.get('bs');

        var clientRooms = {};

        // New client opened
        bs.on('connection', function(client){
            debugbs('new client connected with id '+client.id);

            // Stream created
            client.on('stream', function(stream, meta){
                debugbs(meta);
                if(meta.type === 'audio'){
                    debugbs('>>>Incoming audio stream');

                    // broadcast to all other clients in same room
                    var clientsToSend = _.keys(_.pick(clientRooms, function(val){
                        return val === clientRooms[client.id];
                    }));
                    debugbs(clientsToSend);
                    _.forEach(clientsToSend, function(id){
                        var otherClient = bs.clients[id];
                        if(otherClient != client){
                            var send = otherClient.createStream(meta);
                            stream.pipe(send);
                        }
                    });

                    stream.on('end', function() {
                      debugbs('||| Audio stream ended');
                    });

                }
                else if(meta.type === 'control'){
                    debugbs('Incoming control message');
                    
                    if(meta.action === 'enter'){
                        stream.on('data', function(data){
                            debugbs(data);
                            clientRooms[client.id] = data.room;
                        });
                    }
                    else if(meta.action === 'leave'){
                        stream.on('data', function(data){
                            clientRooms[client.id] = undefined;
                        });
                    }
                }

            });
        });



        //establish SocketIO connection
        var io = keystone.get('io');
        var session = keystone.get('express session');

        io.use(function(socket, next){
            session(socket.handshake, {}, next);
        });

        io.on('connect', function(socket){
            debugsocket('--- ' + socket.id + ' connected');
            socket.emit('syn');
            
            // session.eventid set in route controller for event
            socket.on('ack', function(){
                socket.emit('syn-ack', socket.handshake.session.user);
                socket.join(socket.handshake.session.eventid);

                // monitor the variable until db query sets it
                var monitor = setInterval(function(){
                    if(typeof socket.handshake.session.eventDetails !== 'undefined'){
                        clearInterval(monitor);
                        socket.emit('event-details', socket.handshake.session.eventDetails);
                        delete socket.handshake.session.eventDetails;
                    }
                }, 1000);
            });

            var currentChatroom = '';
            socket.on('enter-chat-room', function(data){
                socket.join(data.room);
                currentChatroom = data.room;
                io.to(currentChatroom).emit('chat-room-enter', {user: data.user});
            });
            socket.on('leave-chat-room', function(data){
                socket.broadcast.to(currentChatroom).emit('chat-room-leave', {user: data.user});
            });
            socket.on('chat-text-send', function(msg){
                socket.broadcast.to(currentChatroom).emit('chat-text-receive', msg);
            });
            socket.on('chat-audio-send', function(msg){
                io.to(currentChatroom).emit('chat-audio-receive', msg);
            });

            socket.on('person-state-change', function(person){
                socket.broadcast.to(socket.handshake.session.eventid).emit('scene-state-change', {
                    person: person
                });
            });

            socket.on('disconnect', function(){
                debugsocket('--- ' + socket.id + ' disconnected');
                socket.broadcast.to(socket.handshake.session.eventid).emit('scene-person-disconnect', socket.id.substr(2));
            });
        });

    }
});
