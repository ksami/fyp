////////////////////////////////
// Route controller for event //
////////////////////////////////

var keystone = require('keystone'),
    debugdb = require('debug')('vPoster:db'),
    Event = keystone.list('Event');
 
exports = module.exports = function(req, res) {

    var view = new keystone.View(req, res);

    view.on('init', function(next){
        // ensure logged in
        if (!req.user) {
            return res.redirect('/keystone/signin');
        }
        next();
    });

    //NOTE: also see /server.js for socket.io stuff
    view.on('get', function(next){
        //TODO: login status?
        var eventid = req.params.id;
        res.locals.eventname = eventid;
        req.session.eventid = eventid;

        //find details of Event by querying db
        var Event = keystone.list('Event');
        Event.model.findOne()
        .where('name').equals(eventid)
        .exec()
        .then(function(event){
            if(event === null){
                debugdb('+++ no results');
                res.status(404).render('errors/404', {
                    errorTitle: 'Event not found',
                    errorMsg: 'Event not found in database'
                });
            }
            else{
                debugdb('+++ data found');
                debugdb(event);
                req.session.eventDetails = event;
                next();
                // socket.emit('eventDetails', event);
            }
        }, function(err){
            debugdb('+++ db error');
            debugdb(err);
            res.status(500).render('errors/404', {
                error: err,
                errorTitle: 'Internal server error',
                errorMsg: 'Database error'
            });
        });
    
    });

    
    view.render('event');
    
}

