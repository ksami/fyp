///////////////////////////////////////////
// Route controller for create new event //
///////////////////////////////////////////

var keystone = require('keystone'),
    Event = keystone.list('Event'),
    Room = keystone.list('Room'),
    Booth = keystone.list('Booth'),
    User = keystone.list('User'),
    crypto = require('crypto'),
    _ = require('underscore'),
    emailServer = require('emailjs/email').server.connect({
       user:    process.env.SERVER_EMAIL_ADD,
       password:process.env.SERVER_EMAIL_PW,
       host:    process.env.SERVER_EMAIL_HOST,
       ssl:     true
    });

const ROOM_MAX_SIZE = 10;
 
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

        var verifiedParticipants = [];

        var eventName = locals.formData.name;

        // check against this array
        var categoriesCheck = _.map(locals.formData.categories.split('\n'), (cat)=>{return cat.trim().toUpperCase();});

        // csv contains participant details on each line in the format:
        // {email}, {category}
        var csv = _.map(locals.formData.csv.split('\n'), (line)=>{
            return _.map(line.split(','), (detail)=>{return detail.trim();});
        });

        // check if csv has header
        var rowStart = 0;
        var hasHeader = locals.formData.hasHeader;
        if(hasHeader === 'on'){
            rowStart = 1;
        }

        try{
            // Verify csv
            
            for(var i=rowStart; i<csv.length; i++){
                var participant = csv[i];
                var email = participant[0];
                var category = participant[1];

                // category check
                if( !(_.contains(categoriesCheck, category.toUpperCase())) ){
                    throw `CSV verification error: ${category} in csv not in categories`;
                }

                // email check
                if( !(/.+@.+\..+/i.test(email)) ){
                    throw `CSV verification error: ${email} in csv not a proper email`;
                }


                verifiedParticipants.push({
                    email,
                    category
                });
            }



            var users=[];
            var booths=[];
            var rooms=[];
            for(var i=0; i<verifiedParticipants.length; i++){
                // Create Users
                
                var email = verifiedParticipants[i].email;
                var category = verifiedParticipants[i].category.toLowerCase();
                
                // first part of email
                var name = email.split('@')[0];

                // random string of 8 chars
                var pass = crypto.randomBytes(4).toString('hex').slice(0,8);

                //DEBUG: switch off emails
                // sendEmail('accountCreated', {
                //     adminName: `${req.user.name.first} ${req.user.name.last}`,
                //     email,
                //     eventName,
                //     name,
                //     pass
                // });

                var user = new User.model({
                    name: {first: name, last: ''},
                    password: pass,
                    isParticipant: true,
                    email
                });

                users.push(user);



                // Create Booths

                //TODO: poster size
                var booth = new Booth.model({
                    poster: '',
                    user: user._id
                });

                booths.push(booth);



                // Create Rooms

                //if room not already created
                //  create new room
                //else
                //  if room is full
                //    create new room with idx++
                //  else
                //    find index in rooms

                var roomsMatchingCategory = _.filter(rooms, (room)=>{return room.category == category;});

                // room for this category not created yet
                if(_.isEmpty(roomsMatchingCategory)){
                    var room = new Room.model({
                        idx: 0,
                        booths: [booth._id],
                        category
                    });
                    rooms.push(room);
                }
                else{
                    // choose room with largest idx number
                    var lastRoomIdx = _.max(_.pluck(roomsMatchingCategory, 'idx'));
                    var room = _.find(roomsMatchingCategory, (r)=>{return r.idx == lastRoomIdx;});
                    
                    // room is full
                    if(room.booths.length >= ROOM_MAX_SIZE){
                        var newRoom = {
                            idx: (lastRoomIdx+1),
                            booths: [booth._id],
                            category
                        };
                        room = new Room.model(newRoom);
                        rooms.push(room);
                    }
                    else{
                        // modify the room in rooms
                        var index = _.findIndex(rooms, (r)=>{
                            return (r.category == category) && (r.idx == lastRoomIdx);
                        });
                        rooms[index].booths.push(booth._id);
                    }
                }



            }


            // Create Event

            var event = new Event.model({
                name: eventName,
                numRooms: rooms.length,
                rooms
            });
            console.log('rooms ' , rooms);


            // save everything to database
            _.invoke(users, 'save', errHandlerDb);
            _.invoke(booths, 'save', errHandlerDb);
            _.invoke(rooms, 'save', errHandlerDb);
            event.save(errHandlerDb);

            locals.isCreated = true;
        }
        catch(err){
            //TODO: handle error
            console.log(`Error: ${err}, please fix and resubmit`);
            locals.errMsg = `Error: ${err}, please fix and resubmit`;
            locals.isCreated = false;
        }
        finally{
            next();
        }
    });


    view.render('createEvent');
    
};




function sendEmail(type, args){
    var templates = {
        accountCreated: {
           from:    'vPoster <admin@vposter.com>',
           to:      `${args.name} ${args.email}`,
           subject: 'New account created at vPoster',
           text:    `${args.adminName} has created an account for you for the event: ${args.eventName}
                    Login at http://localhost:3000 with the credentials below to edit your details and participate in the event.
                    Username: ${args.email}
                    Password: ${args.pass}`
        }
    };

    emailServer.send(templates[type], function(err, message){
        if(err){
            console.log('--- Email error: ');
            console.log(err);
        }
    });
}


function errHandlerDb(err){
    if(err){
        console.log('--- Database error: ');
        console.log(err);
    }
}