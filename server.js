////////////
// Server //
////////////

require('dotenv').load();
var socketio = require('socket.io');
var keystone = require('keystone');
var mongoose = require('mongoose');
keystone.set('mongoose', mongoose);
var debugsocket = require('debug')('vPoster:socket');
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
        url = '/event/1';
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
    },

    onStart: function(){
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

            socket.on('chat-text-send', function(msg){
                socket.broadcast.to(socket.handshake.session.eventid).emit('chat-text-receive', msg);
            });

            socket.on('person-state-change', function(person){
                socket.broadcast.to(socket.handshake.session.eventid).emit('scene-state-change', {
                    person: person
                });
            });

            socket.on('disconnect', function(){
                debugsocket('--- ' + socket.id + ' disconnected');
            });
        });

    }
});
