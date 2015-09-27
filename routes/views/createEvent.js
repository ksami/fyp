///////////////////////////////////////////
// Route controller for create new event //
///////////////////////////////////////////

var keystone = require('keystone'),
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

        var newEvent = new Event.model({
            name: locals.formData.name,
            num: locals.formData.num
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