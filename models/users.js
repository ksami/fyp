////////////////
// User Model //
////////////////

var keystone = require('keystone'),
    Types = keystone.Field.Types;
 
var User = new keystone.List('User');
 
User.add({
    name: { type: Types.Name, required: true, index: true },
    email: { type: Types.Email, initial: true, required: true, index: true },
    password: { type: Types.Password, initial: true },
    canAccessKeystone: { type: Boolean, initial: true },
    isAdmin: { type: Boolean, default: false, label: 'Admin' },
    isOrganiser: { type: Boolean, default: false, label: 'Organiser' },
    isParticipant: { type: Boolean, default: false, label: 'Participants' },
    isPublic: { type: Boolean, default: true, label: 'Public' }
});
 
User.register();
