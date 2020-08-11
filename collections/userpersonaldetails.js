var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/Aalap',{useNewUrlParser : true, useUnifiedTopology : true });
// mongoose.connect('mongodb://user:pw@host1.com:27017/dbname', { useNewUrlParser: true })

var mongoSchema = mongoose.Schema;

var UserPersonalDetailsSchema = {
"userID":String,
"sexualOrientation":String,
"orientationStatus":String,
"marriagestatus":String,
"mrgStatus" : String,
"hobbies":String,
"occupation":String,
"occupationStatus":String,
"primaryLanguage":String,
"lastseen":String,
"online":String,
"createdAt":String

};
module.exports = mongoose.model('UserPersonalDetails',UserPersonalDetailsSchema);