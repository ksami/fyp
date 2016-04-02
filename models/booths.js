/////////////////
// Booth Model //
/////////////////

var keystone = require('keystone'),
    Types = keystone.Field.Types;

var Booth = new keystone.List('Booth');

Booth.add({
    name: { type: String, label: 'Name of project' },
    poster: { type: String, label: 'Poster URL' },
    audio: { type: String, label: 'Audio URL' },
    video: { type: String, label: 'Video URL' },
    user: { type: Types.Relationship, ref: 'User' }
});

Booth.relationship({ path: 'rooms', ref: 'Room', refPath: 'booths' });

Booth.register();