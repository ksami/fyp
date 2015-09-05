////////////
// Server //
////////////

var socketio = require('socket.io');
var keystone = require('keystone');
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
    }
});
