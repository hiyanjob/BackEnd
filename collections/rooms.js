var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/Aalap',{useNewUrlParser : true, useUnifiedTopology : true });
// mongoose.connect('mongodb://user:pw@host1.com:27017/dbname', { useNewUrlParser: true })

var mongoSchema = mongoose.Schema;

var roomsSchema = {
"chatUSersId":String/*{type:mongoose.Schema.Types.ObjectId, ref : 'usermasters', required: true}*/,
//"chatUSersId2":/*String*/{type:mongoose.Schema.Types.ObjectId, ref : 'usermasters', required: true},
"groupName":String,
"type":String,
"status":String,
"createdAt":String
};
module.exports = mongoose.model('room',roomsSchema);