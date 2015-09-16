////////////////////////////////
// Route controller for event //
////////////////////////////////

var keystone = require('keystone'),
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

    view.on('get', function(next){
        var eventid = req.params.id;
        res.locals.eventname = eventid;
        req.session.eventid = eventid;
    
        next();
    });

    
    view.render('event');
    
}

