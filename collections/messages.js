var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/Aalap',{useNewUrlParser : true, useUnifiedTopology : true });
// mongoose.connect('mongodb://user:pw@host1.com:27017/dbname', { useNewUrlParser: true })

var mongoSchema = mongoose.Schema;

var messageSchema = {
"roomsId":String,
"content":String,
"time":String,
"message_status":String,
"chatUsersId" : String,
"type":String,
"username":String,
"receiver_name":String,
"chatSenderId":String,
"chatReceiverId":String,
"sender_profile_pic":String,
"date":String,
"receiver_profile_pic":String,
"messagesBySender":String,
"profile_pic":String,
"group_name":String,
"messageCustomId" :String,
"onlineSenderStatus":String,
"onlinereceiverStatus":String
};
module.exports = mongoose.model('messages',messageSchema);