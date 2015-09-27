var keystone = require('keystone'),
    Types = keystone.Field.Types;
 
var Event = new keystone.List('Event');
 
Event.add({
    name: { type: String, required: true },
    num: { type: Types.Number, required: true, default: "4" },
    participants: { type: Types.Email, many: true }
});
 
Event.register();
