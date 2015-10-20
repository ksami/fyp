///////////////////////////////////////////
// Route controller for create new event //
///////////////////////////////////////////

var keystone = require('keystone'),
    Event = keystone.list('Event'),
    User = keystone.list('User'),
    crypto = require('crypto'),
    _ = require('underscore'),
    emailServer = require('emailjs/email').server.connect({
       user:    process.env.SERVER_EMAIL_ADD,
       password:process.env.SERVER_EMAIL_PW,
       host:    process.env.SERVER_EMAIL_HOST,
       ssl:     true
    });
 
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

        // parse csv
        //TODO: no verification of csv
        var users = [];
        var failedEmails = [];
        var categories = {};
        var csv = locals.formData.csv.split('\n');

        var rowStart = 0;
        var hasHeader = locals.formData.hasHeader;
        if(hasHeader === 'on'){
            rowStart = 1;
        }


        for (var i = rowStart; i < csv.length; i++) {

            var participant = csv[i].split(',');
            var email = participant[0].trim();

            // if looks like an email
            if(/.+@.+\..+/i.test(email)){
                // create new User for each email
                var name = email.split('@')[0];
                var pass = crypto.randomBytes(4).toString('hex').slice(0,8);

                var newUser = new User.model({
                    name: {first: name, last: ''},
                    email: email,
                    password: pass,
                    isParticipant: true
                });
                users.push(newUser._id);
                newUser.save(function(err){
                    if(err){
                        console.log('--- Error: ');
                        console.log(err);
                    }
                });

                // send emails to newly created users
                //DEBUG:
                emailServer.send({
                   from:    'vPoster <admin@vposter.com>',
                   to:      `${name} ${email}`,
                   subject: 'New account created at vPoster',
                   text:    `${req.user.name.first} ${req.user.name.last} has created an account for you for the event: ${locals.formData.name}
                            Login at http://localhost:3000 with the credentials below to edit your details and participate in the event.
                            Username: ${email}
                            Password: ${pass}`
                }, function(err, message) {
                    if(err){
                        console.log('--- Error: ');
                        console.log(err);
                    }
                    else{
                        console.log('- Email sent: ' + email);
                    }
                });
                
                // categories in the event
                var category = participant[1].trim();
                if(categories.hasOwnProperty(category)){
                    categories[category]++;
                }
                else{
                    categories[category] = 1;
                }
            }
            else{
                // email doesn't pass basic verification check, category also won't be added
                failedEmails.push(email);
            }

        }

        // calculate number of rooms needed
        var NUM_PLACES = 10;
        var numRooms = 0;
        var categoriesUnique = [];
        for(var cat in categories){
            if(categories.hasOwnProperty(cat)){
                numRooms += Math.ceil(categories[cat]/NUM_PLACES);
                categoriesUnique.push(cat);
            }
        }


        // add to Event
        var newEvent = new Event.model({
            name: locals.formData.name,
            numRooms: numRooms,
            participants: users,
            categories: categoriesUnique
        });
        newEvent.save(function(err){
            if(err){
                console.log('--- Error: ');
                console.log(err);
                // req.flash('error', 'Error creating event');
            }
            else{
                console.log('--- Event successfully added');
                locals.failedEmails = failedEmails;
                locals.isCreated = true;
                // req.flash('success', 'Your event was successfully created');
                // return res.redirect('/');
            }
            next();
        });

    });

    view.render('createEvent');
    
}