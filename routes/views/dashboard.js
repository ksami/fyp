/////////////////////////////////////////////////
// Route controller for Partcipant's dashboard //
/////////////////////////////////////////////////

var keystone = require('keystone'),
    _ = require('underscore'),
    Event = keystone.list('Event'),
    User = keystone.list('User');
 
exports = module.exports = function(req, res) {
    
    var view = new keystone.View(req, res),
        locals = res.locals;
    locals.formData = req.body || {};

    view.on('init', function(next){
        // ensure logged in
        if (!req.user) {
            return res.redirect('/keystone/signin');
        }
        else if(!req.user.isParticipant){
            locals.isAuthorized = false;
            locals.errorMsg = 'Not authorized';
        }
        else{
            locals.isAuthorized = true;
            Event.model.find()
            .select('name num')
            .where('participants')
            .in([req.user._id])
            .exec(function(err,events){
                console.log(events);
                locals.events = events;
                next();
            });
        }
    });


    view.render('dashboard');
    
}