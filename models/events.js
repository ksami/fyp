var keystone = require('keystone'),
    Types = keystone.Field.Types;
 
var Event = new keystone.List('Event');
 
Event.add({
    name: { type: String, required: true },
    numRooms: { type: Types.Number, required: true, default: "4" },
    participants: { type: Types.Relationship, ref: 'User', many: true },
    categories: { type: String, many: true }
});
 
Event.register();
