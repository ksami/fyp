// Creates Admin user

var keystone = require('keystone'),
    User = keystone.list('User');
 
exports = module.exports = function(done) {
    
    new User.model({
        name: { first: 'Admin', last: 'User' },
        email: 'user@keystonejs.com',
        password: 'admin',
        canAccessKeystone: true,
        isAdmin: true,
        isOrganiser: true,
        isParticipant: true,
        isPublic: true
    }).save(done);
    
};