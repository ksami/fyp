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
        var csv = locals.formData.csv.split('\n');
        var participants = _.map(csv, function(line){
            return line.split(',');
        });

        // validate emails
        var emailsStripped = _.map(_.map(participants, _.first), function(email){
            return email.trim();
        });
        var emailsValidated = _.groupBy(emailsStripped, function(email){
            return /.+@.+\..+/i.test(email);
        });

  
        // create new User for each email
        var users = [];
        for (var i = 0; i < emailsValidated['true'].length; i++) {
            var email = emailsValidated['true'][i];
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
            // emailServer.send({
            //    from:    'vPoster <admin@vposter.com>',
            //    to:      name + ' ' + email,
            //    subject: 'New account created at vPoster',
            //    text:    'Username: ' + email + '\nPassword: ' + pass
            // }, function(err, message) {
            //     if(err){
            //         console.log('--- Error: ');
            //         console.log(err);
            //     }
            //     else{
            //         console.log('- Email sent: ' + email);
            //     }
            // });
        }


        // categories in the event
        var NUM_PLACES = 10;
        var categories = _.map(_.map(participants, _.last), function(category){
            return category.trim();
        });
        var categoriesUnique = _.uniq(categories);
        var categoryCount = _.countBy(categories, function(category){
            return category;
        });

        var numExtraRooms = _.reduce(_.filter(categoryCount, function(count){
            return count > NUM_PLACES;
        }), function(memo, num){
            return memo + Math.floor(num/NUM_PLACES);
        }, 0);


        // add to Event
        var newEvent = new Event.model({
            name: locals.formData.name,
            numRooms: numExtraRooms + categoriesUnique.length,
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
                locals.failedEmails = emailsValidated['false'];
                locals.isCreated = true;
                // req.flash('success', 'Your event was successfully created');
                // return res.redirect('/');
            }
            next();
        });

    });

    view.render('createEvent');
    
}