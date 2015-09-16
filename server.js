////////////
// Server //
////////////

var socketio = require('socket.io');
var keystone = require('keystone');
var debugsocket = require('debug')('socket');
var debugdb = require('debug')('db');
var debug = require('debug')('info');

keystone.init({

    'name': 'vPoster',
    'brand': 'vPoster',
    
    'favicon': 'public/favicon.ico',
    'static': 'public',
    
    'views': 'templates/views',
    'view engine': 'jade',
    
    'auto update': true,
    'mongo': 'mongodb://localhost/vposter',
    
    'session': true,
    'auth': true,
    'user model': 'User',
    'cookie secret': '707f792d71de714353a68c9339e1f2000064eec7'
  
});

require('./models');

keystone.set('routes', require('./routes'));

//after sign-in, where are they redirected to?
keystone.set('signin redirect', function(user, req, res){
    var url = (user.canAccessKeystone || user.isAdmin) ? '/keystone' : '/createEvent';
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


        function queryEventDetails(socket, eventid){
            //find details of Event by querying db
            var Event = keystone.list('Event');
            Event.model.findOne()
                .where('name').equals(eventid)
                .exec(function(err, event){
                    if(err){
                        debugdb('+++ db error')
                        debugdb(err);
                    }
                    else{
                        if(event === null){
                            debugdb('+++ no results');
                        }
                        else{
                            debugdb('+++ data found');
                            debugdb(event);
                            socket.emit('eventDetails', event);
                        }
                    }
                });
        }
        
        io.on('connect', function(socket){
            debugsocket('--- ' + socket.id + ' connected from ');
            socket.emit('syn');
            
            // session.eventid set in route controller for event
            socket.on('ack', function(){
                socket.emit('syn-ack');
                queryEventDetails(socket, socket.handshake.session.eventid);
            });
            debugsocket(socket.handshake.session);

            socket.on('disconnect', function(){
                debugsocket('--- ' + socket.id + ' disconnected from ');
            });
        });
    }
});
