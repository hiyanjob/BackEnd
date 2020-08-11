var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/Aalap',{useNewUrlParser : true, useUnifiedTopology : true });
// mongoose.connect('mongodb://user:pw@host1.com:27017/dbname', { useNewUrlParser: true })

var mongoSchema = mongoose.Schema;

var FriendsListSchema = {
"userid":String,
"senderId":String,
"receiverId":String,
"reqStatus":String,
"updateAt":String,
"createdAt" :String
};
module.exports = mongoose.model('friendsList',FriendsListSchema);