/////////////////
// Booth Model //
/////////////////

var keystone = require('keystone'),
    Types = keystone.Field.Types;

var Booth = new keystone.List('Booth');

//TODO: poster is a placeholder
Booth.add({
    poster: { type: String, label: 'Poster' },
    user: { type: Types.Relationship, ref: 'User' }
});

Booth.relationship({ path: 'rooms', ref: 'Room', refPath: 'booths' });

Booth.register();