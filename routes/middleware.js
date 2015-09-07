///////////////////////////////////////
// Middleware for application routes //
///////////////////////////////////////

var _ = require('underscore'),
    keystone = require('keystone');
 
/**
    Initialises the standard view locals.
    Include anything that should be initialised before route controllers are executed.
*/
exports.initLocals = function(req, res, next) {
    
    var locals = res.locals;
    
    locals.user = req.user;
    
    // Add your own local variables here
    
    //navbar links
    locals.navLinks = [
        { label: 'Home', key: 'home', href: '/' }
    ];
    
    next();
    
};
 
/**
    Inits the error handler functions into `res`
*/
exports.initErrorHandlers = function(req, res, next) {
    
    res.err = function(err, title, message) {
        res.status(500).render('errors/500', {
            err: err,
            errorTitle: title,
            errorMsg: message
        });
    }
    
    res.notfound = function(title, message) {
        res.status(404).render('errors/404', {
            errorTitle: title,
            errorMsg: message
        });
    }
    
    next();
    
};
 
/**
    Fetches and clears the flashMessages before a view is rendered
*/
exports.flashMessages = function(req, res, next) {
    
    var flashMessages = {
        info: req.flash('info'),
        success: req.flash('success'),
        warning: req.flash('warning'),
        error: req.flash('error')
    };
    
    res.locals.messages = _.any(flashMessages, function(msgs) { return msgs.length }) ? flashMessages : false;
    
    next();
    
};

/**
 *   Socketio server-side events
 */
exports.handleSocketio = function(req, res, next) {

    var io = keystone.get('io');
    var username = req.ip;
    res.locals.eventname = 'Event Name 1';

    //connection occurs only when client loads /templates/views/event.jade
    io.on('connection', function(socket){
        console.log('--- ' + username + ' connected');

        socket.on('disconnect', function(){
            console.log('--- ' + username + ' disconnected');
        });
    });


    next();
};