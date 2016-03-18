/////////////////////////////////////////
// Route controller for home page view //
/////////////////////////////////////////

var keystone = require('keystone'),
    Booth = keystone.list('Booth'),
    Room = keystone.list('Room'),
    Event = keystone.list('Event'),
    User = keystone.list('User');
var _ = require('underscore');
 
exports = module.exports = function(req, res) {
    
    var view = new keystone.View(req, res),
        locals = res.locals;
    locals.formData = req.body || {};

    view.on('get', function(next){
        if(req.user){
            Event.model
            .find()
            .exec()
            .then(function(events){
                locals.events = _.map(events, function(e){
                    return {name: e.name, id: e.id};
                });
                next();
            }, function(err){
                console.log(err);
            });
        }
        else{
          next();
        }
    });
    
    view.render('index');
    
}