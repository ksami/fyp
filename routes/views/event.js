////////////////////////////////
// Route controller for event //
////////////////////////////////

var keystone = require('keystone'),
    Event = keystone.list('Event');
 
exports = module.exports = function(req, res) {
    
    var view = new keystone.View(req, res);

    var eventname = '1';
    res.locals.eventname = eventname;


    var io = keystone.get('io');
    var username = req.ip;

    //establish SocketIO connection
    io.on('connection', function(socket){
        console.log('--- ' + username + ' connected');
        
        //find details of Event by querying db
        Event.model.find()
            .where('name', eventname)
            .exec(function(err, events){
                if(err){
                    console.log('+++ error');
                    console.log(err);
                }
                else{
                    if(events.length === 0){
                        console.log('+++ no results');
                    }
                    else{
                        console.log('+++ data found');
                        console.log(events[0]);
                        socket.emit('eventDetails', events[0]);
                    }
                }
            });


        socket.on('disconnect', function(){
            console.log('--- ' + username + ' disconnected');
        });
    });


    
    view.render('event');
    
}