/////////////////////////////////////////////////
// Route controller for Partcipant's dashboard //
/////////////////////////////////////////////////

var keystone = require('keystone'),
    _ = require('underscore'),
    Event = keystone.list('Event'),
    Booth = keystone.list('Booth'),
    User = keystone.list('User');
 
exports = module.exports = function(req, res) {
    
    var view = new keystone.View(req, res),
        locals = res.locals;
    locals.formData = req.body || {};

    view.on('get', function(next){
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
            locals.isSubmitted = false;
            locals.errMsg = '';
            Booth.model.find({user: req.user._id})
            .exec(function(err,booth){
                locals.poster = booth[0] ? booth[0].poster : '';
                next();
            });
        }
    });

    view.on('post', function(next){
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
            locals.isSubmitted = false;
            locals.errMsg = '';

            Booth.model.findOneAndUpdate({user: req.user._id}, {$set: {poster: locals.formData.posterUrl}}, {new: true})
            .exec(function(err,booth){
                if(booth){
                    locals.isSubmitted = true;
                    locals.poster = booth.poster;
                }
                else{
                    locals.errMsg = 'You have not been assigned to a booth/event.';
                    locals.poster = '';
                }
                next();
            });
        }
    });


    view.render('dashboard');
    
}