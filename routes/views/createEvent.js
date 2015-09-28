///////////////////////////////////////////
// Route controller for create new event //
///////////////////////////////////////////

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
        next();
    });

    view.on('get', function(next){
        locals.isCreated = false;
    
        next();
    });
    
    // Create an Event
    view.on('post', { action: 'create-event' }, function(next) {

        // validate emails
        var emails = locals.formData.emails.split('\n');
        var emailsStripped = _.map(emails, function(email){
            return email.trim();
        });
        var validated = _.groupBy(emailsStripped, function(email){
            return email.indexOf('@') !== -1;
        });

        // create new User for each email
        var users = [];
        for (var i = 0; i < validated['true'].length; i++) {
            var email = validated['true'][i];

            var newUser = new User.model({
                name: email,
                email: email,
                // TODO: generate random password
                password: 'pa55w0rd',
                isParticipant: true
            });
            users.push(newUser._id);
            newUser.save(function(err){
                if(err){
                    console.log('--- Error: ');
                    console.log(err);
                }
            });
        }

        // add to Event
        var newEvent = new Event.model({
            name: locals.formData.name,
            num: locals.formData.num,
            participants: users
        });
        newEvent.save(function(err){
            if(err){
                console.log('--- Error: ');
                console.log(err);
                // req.flash('error', 'Error creating event');
            }
            else{
                console.log('--- Event successfully added');
                locals.failedEmails = validated['false'];
                locals.isCreated = true;
                // req.flash('success', 'Your event was successfully created');
                // return res.redirect('/');
            }
            next();
        });

    });

    view.render('createEvent');
    
}