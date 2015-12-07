var keystone = require('keystone'),
    Types = keystone.Field.Types;
 
var Event = new keystone.List('Event');
 
Event.add({
    name: { type: String, required: true },
    numRooms: { type: Types.Number, required: true, default: '4' },
    rooms: { type: Types.Relationship, ref: 'Room', many: true }
});
 
Event.register();
