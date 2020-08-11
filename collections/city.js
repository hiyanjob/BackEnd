var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/Aalap',{useNewUrlParser : true , useUnifiedTopology : true});
// mongoose.connect('mongodb://user:pw@host1.com:27017/dbname', { useNewUrlParser: true })

var mongoSchema = mongoose.Schema;

var citySchema = {
"cityName":String,
"cnryID":String,
"status":String,
"updateAt":String,
"createdAt" :String
};
module.exports = mongoose.model('city',citySchema);