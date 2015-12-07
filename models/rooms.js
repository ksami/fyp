////////////////
// Room Model //
////////////////

var keystone = require('keystone'),
    Types = keystone.Field.Types;

var Room = new keystone.List('Room');

Room.add({
    idx: { type: Types.Number, label: 'for duplicate categories', required: true, default: '0' },
    category: { type: String, label: 'Category in event', required: true, default: 'none' },
    booths: { type: Types.Relationship, ref: 'Booth', many: true }
});

Room.relationship({ path: 'events', ref: 'Event', refPath: 'rooms' });

Room.register();