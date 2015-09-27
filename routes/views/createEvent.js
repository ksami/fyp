///////////////////////////////////////////
// Route controller for create new event //
///////////////////////////////////////////

var keystone = require('keystone'),
    _ = require('underscore'),
    Event = keystone.list('Event');
 
exports = module.exports = function(req, res) {
    
    var view = new keystone.View(req, res),
        locals = res.locals;
    locals.formData = req.body || {};
    
    // Create an Event
    view.on('post', { action: 'create-event' }, function(next) {
        console.log('--- event posting');
        console.log('--- name: ' + locals.formData.name);
        console.log('--- num : ' + locals.formData.num);
        console.log('--- emails : ' + locals.formData.emails);

        // validate emails
        var emails = locals.formData.emails.split('\n');
        var emailsStripped = _.map(emails, function(email){
            return email.trim();
        });
        var validated = _.groupBy(emailsStripped, function(email){
            return email.indexOf('@') !== -1;
        });

        // create new User for each email
        // add to Event
        var newEvent = new Event.model({
            name: locals.formData.name,
            num: locals.formData.num,
            participants: validated['true']
        });
        newEvent.save(function(err){
            if(err){
                console.log('--- Error: ');
                console.log(err);
                // req.flash('error', 'Error creating event');
            }
            else{
                console.log('--- Event successfully added');
                // req.flash('success', 'Your event was successfully created');
                return res.redirect('/');
            }
            next();
        });
        
        // var newEvent = new Event.model();
        
        // var updater = newEvent.getUpdateHandler(req);
        
        // updater.process(req.body, {
        //     fields: 'name',
        //     flashErrors: true,
        //     logErrors: true
        // }, function(err) {
        //     if (err) {
        //         data.validationErrors = err.errors;
        //     } else {
        //         req.flash('success', 'Your event was created.');
                
        //         return res.redirect('/');
        //     }
        // });

        // return res.redirect('/');
    });

    view.render('createEvent');
    
}