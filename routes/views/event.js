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
    
        //establish SocketIO connection
        // var io = keystone.get('io');
        // var username = req.ip;
    
        // io.on('connect', function(socket, username, eventid){
        //     console.log('--- ' + socket.id + ' connected from ' + username);
            
        //     // socket.on('ack', queryEventDetails);

        //     function queryEventDetails(){
        //         //find details of Event by querying db
        //         Event.model.findOne()
        //             .where('name').equals(eventid)
        //             .exec(function(err, event){
        //                 if(err){
        //                     console.log('+++ error');
        //                     console.log(err);
        //                 }
        //                 else{
        //                     if(event === null){
        //                         console.log('+++ no results');
        //                     }
        //                     else{
        //                         console.log('+++ data found');
        //                         console.log(event);
        //                         socket.emit('eventDetails', event);
        //                     }
        //                 }
        //             });
        //     }
        //     queryEventDetails();
    

        //     socket.on('disconnect', function(){
        //         console.log('--- ' + socket.id + ' disconnected from ' + username);
        //         socket.removeListener('ack', queryEventDetails);
        //     });
        // });

        next();
    });

    
    view.render('event');
    
}

