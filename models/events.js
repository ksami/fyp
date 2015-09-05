var keystone = require('keystone'),
    Types = keystone.Field.Types;
 
var Event = new keystone.List('Event');
 
Event.add({
    name: { type: String, required: true },
    num: { type: String, required: true, default: "4" }
});
 
Event.register();
