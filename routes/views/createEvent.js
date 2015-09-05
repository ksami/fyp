///////////////////////////////////////////
// Route controller for create new event //
///////////////////////////////////////////

var keystone = require('keystone');
 
exports = module.exports = function(req, res) {
    
    var view = new keystone.View(req, res),
        locals = res.locals;
    locals.formData = req.body || {};
    
    // Create an Event
    view.on('post', { action: 'create-event' }, function(next) {
        console.log('--- event posting');
        console.log('--- name: ' + locals.formData.name);
        console.log('--- num : ' + locals.formData.num);
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
        //         req.flash('success', 'Your comment was added.');
                
        //         return res.redirect('/');
        //     }
        //     next();
        // });

        return res.redirect('/');
    });

    view.render('createEvent');
    
}