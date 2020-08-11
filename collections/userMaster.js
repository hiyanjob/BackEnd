var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/Aalap',{useNewUrlParser : true, useUnifiedTopology : true });
// mongoose.connect('mongodb://user:pw@host1.com:27017/dbname', { useNewUrlParser: true })

var mongoSchema = mongoose.Schema;

var userSchema = {
"email":{
	type: String,
	required : "must give a valid email id."
},
"mobile_no":String,
"password":String,
"dob":String,
"screenName" :{
	type: String,
	required : "must give a unique name."
},
"referalCode":String,
"otp":String,
"otpVerify":String,
"profilePic":String,
"tagline":String,
"age":String,
"ageStatus":String,
"country":String,
"city":String,
"gender":String,
"genderStatus":String,
"lastseen":String,
"online":String,
"status":String,
"createdAt":String
};
module.exports = mongoose.model('UserMaster',userSchema);