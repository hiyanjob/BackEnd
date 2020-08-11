var express = require('express');
var app = express();
var fs = require('fs');
var port = 3005;
var http = require('http');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require('path');
var multer = require('multer');
var FormData = require('form-data');
var nodemailer = require('nodemailer');
var ObjectId = require('mongodb').ObjectID;
var dateFormat = require('dateformat');
var urlencode = require('urlencode');
var util = require('util');
//var xmlParser = require('xml2json');


var register = require("./collections/userMaster");
var prsnlDet = require("./collections/userpersonaldetails");
var messages = require("./collections/messages");
var frdrequest = require("./collections/friendslist");
var rooms = require("./collections/rooms");
var country = require("./collections/country");
var city = require("./collections/city");
var hobbies = require("./collections/hobbies");
var language = require("./collections/language");
var occupation = require("./collections/occupations");


// var expressValidator = require('express-validator')
// app.use(expressValidator())

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }))

var flash = require('express-flash')
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(cookieParser('keyboard cat'))
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))
app.use(flash())



function getAge(dateString) {
  var now = new Date();
  var today = new Date(now.getYear(), now.getMonth(), now.getDate());

  var yearNow = now.getYear();
  var monthNow = now.getMonth();
  var dateNow = now.getDate();

  var dob = new Date(dateString.substring(6, 10),
    dateString.substring(0, 2) - 1,
    dateString.substring(3, 5)
  );

  var yearDob = dob.getYear();
  var monthDob = dob.getMonth();
  var dateDob = dob.getDate();
  var age = {};
  var ageString = "";
  var yearString = "";
  var monthString = "";
  var dayString = "";


  yearAge = yearNow - yearDob;

  if (monthNow >= monthDob)
    var monthAge = monthNow - monthDob;
  else {
    yearAge--;
    var monthAge = 12 + monthNow - monthDob;
  }

  if (dateNow >= dateDob)
    var dateAge = dateNow - dateDob;
  else {
    monthAge--;
    var dateAge = 31 + dateNow - dateDob;

    if (monthAge < 0) {
      monthAge = 11;
      yearAge--;
    }
  }

  age = {
    years: yearAge,
    months: monthAge,
    days: dateAge
  };

  if (age.years > 1) yearString = " years";
  else yearString = " year";
  if (age.months > 1) monthString = " months";
  else monthString = " month";
  if (age.days > 1) dayString = " days";
  else dayString = " day";


  if ((age.years > 0) && (age.months > 0) && (age.days > 0))
    ageString = age.years/* + yearString + ", " + age.months + monthString + ", and " + age.days + dayString + " old."*/;
  else if ((age.years == 0) && (age.months == 0) && (age.days > 0))
    ageString = /*"Only " + age.days + dayString + " old!"*/ " ";
  else if ((age.years > 0) && (age.months == 0) && (age.days == 0))
    ageString = age.years /*+ yearString + " old. Happy Birthday!!"*/;
  else if ((age.years > 0) && (age.months > 0) && (age.days == 0))
    ageString = age.years /*+ yearString + " and " + age.months + monthString + " old."*/;
  else if ((age.years == 0) && (age.months > 0) && (age.days > 0))
    ageString = /*age.months + monthString + " and " + age.days + dayString + " old."*/" ";
  else if ((age.years > 0) && (age.months == 0) && (age.days > 0))
    ageString = age.years/* + yearString + " and " + age.days + dayString + " old."*/;
  else if ((age.years == 0) && (age.months > 0) && (age.days == 0))
    ageString = /*age.months + monthString + " old."*/ "";
  else ageString = " ";

  return ageString;
}

/*create user in cometchat api start*/
var request = require("request");
const appID = '48942283c24520',
  apiKey = "78ec146ea09632dd15c7fe08d9a4c420af64f5ca";

app.post('/createchatuser', (req, res) => {
  var myname = req.body.name,
    myuid = req.body.uid;

  var data = '{"uid":' + JSON.stringify(myuid) + ',"name":' + JSON.stringify(myname) + '}';
  var options = {
    method: 'POST',
    url: 'https://api.cometchat.com/v1.8/users',
    headers: {
      appid: appID,
      apikey: apiKey,
      'content-type': 'application/json',
      accept: 'application/json'
    },
    body: data
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    else res.send(body);
  });
});
/*create user in cometchat api end*/

/*get friends list api start*/
app.post('/MyFriendsList', (req, res) => {
  var usrId = req.body.userId;
  var options = {
    method: 'GET',
    url: 'https://api.cometchat.com/v1.8/users/' + usrId + '/friends',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      appid: appID,
      apikey: apiKey
    }
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    else res.send(body);
  });

});
/*get friends list api stop*/

/*get user list api start*/
app.post('/UsersListInChat', (req, res) => {
  var usrId = req.body.userId, userResult;
  var options = {
    method: 'GET',
    url: 'https://api.cometchat.com/v1.8/users/' + usrId + '/users',
    headers: {
      appid: appID,
      apikey: apiKey,
      'content-type': 'application/json',
      accept: 'application/json'
    }
  };
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    else {
      userResult = body;
      // console.log(userResult.data)
      res.send(userResult);
    }

  });
});


// get thew message list based onthe user id
app.post('/GetMessages', (req, res) => {
  var subjectUid = req.body.userId, result, totalRes = [], UId =[], lastArray = [];

  //var data = '{"subjectUid":' + JSON.stringify(myuid)  + '}';

  var options = {
    method: 'GET',
    url: 'https://api.cometchat.com/v1.8/users/'+subjectUid+'/messages',
    headers: {
      appid: appID,
      apikey: apiKey,
      'content-type': 'application/json',
      accept: 'application/json'
    }
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    else
    {
      result = JSON.parse(body);

      totalRes = result.data;

      totalRes.map(Element=>
        {
           if(Element.sender == subjectUid) UId.push({ user : Element.receiver});
           else UId.push({ user : Element.sender});
        });

        // UId.map(Element=>
        //   {            
        //      totalRes.map(El =>
        //       {
        //          if(Element.user == El.sender || Element.user == El.receiver)
        //          {
        //              lastArray.push({ otherid : Element.user, msg : El.data.text });
        //          }
        //       })
        //   });
        register.find({ _id : { "$in" :UId.map(x => x.user) } }, { screenName : 1}).then(userRes=>
          {
            res.send(userRes);
          }).catch(Error=>console.log(Error));
     // console.log(lastArray);       
    }
    
  });
});


  // delete the user in both db api start 
  app.post('/DeleteUser',(req,res)=>
  {
     var uid = req.body.userId;

     register.find({ _id : ObjectId(uid) }).then(userResult=>
      {
          if(userResult.length == 0) res.json({"status" : "False", "message" : "No user in this id"});
          else
          {
            register.deleteOne({_id :ObjectId(uid) }).then(deleteUser=>
              {
                var options = {
                  method: 'DELETE',
                  url: 'https://api.cometchat.com/v1.8/users/'+uid,
                  headers: {
                    appid: appID,
                    apikey: apiKey,
                    'content-type': 'application/json',
                    accept: 'application/json'
                  }
                };
                
                request(options, function (error, response, body) {
                  if (error) throw new Error(error);
                 // result = JSON.parse(body);
                  console.log('deleted response',body);    
               //   console.log(body);
                });
                res.json({"status" : "True", "message" : "Deleted successfully"});
              }).catch(err => console.log(err));
            
          }
      }).catch(err=> console.log(err));   
  });  
     // delete the user in both db api stop 

app.post('/hobbies', (req, res) => {
  var now = new Date(), createdAt = dateFormat(now, 'dd-mm-yyyy hh:MM:ss TT');
  new language({
    language: 'Other',
    status: 'Active',
    createdAt: createdAt
  }).save((err, nst) => {
    res.json("successfully");
  });
});

//splash screen api for check the user status
app.post('/SplashScreen', (req,res)=>
{
   var uid = req.body.userId;

   register.find({ _id : ObjectId(uid) }).then(userDetails=>
    {
        if(userDetails.length == 0) res.json({"status" : "False", "message" : "No user in the given userid"});
        else
        {
          let pic = userDetails[0].profilePic;
          if(pic != null && pic != undefined) res.json({"status" : "True", "message" : "You can logged now"}) ;
          else res.json({"status" : "False", "message" : "Upload your profile pic"}) ;
        }
    }).catch(err=> console.log(err));
});


app.post('/signup', (req, res) => {
  register.find({ email: req.body.email }, (err, registerRes) => {
    if (err) { res.json(err, null); }
    else {
      if (registerRes.length != 0) {
        res.json({ "status": "False", "message": "Already use this email." });
      }
      else {
        register.find({ mobile_no: req.body.mobile }, (err, mobileResult) => {
          if (err) res.json(err);
          else {
            if (mobileResult.length != 0) res.json({ "status": "False", "message": "Already use this Mobile." });
            else {
              register.find({ screenName: req.body.screenName }, (err, screenNameResult) => {
                if (err) res.json(err);
                else if (screenNameResult.length != 0) res.json({ "status": "False", "message": "Already use this screenName." });
                else {
                  var now = new Date();
                  createDate = dateFormat(now, "dd-mm-yyyy hh:MM:ss TT");
                  var age = getAge(req.body.dob);
                  new register({
                    email: req.body.email,
                    mobile_no: req.body.mobile,
                    password: req.body.password,
                    dob: req.body.dob,
                    age: age,
                    ageStatus: '0',
                    screenName: req.body.screenName ? req.body.screenName : null,
                    referalCode: req.body.referalCode ? req.body.referalCode : null,
                    status: 'Active',
                    createdAt: createDate
                  }).save((err, registerResult) => {
                    //console.log(registerResult)
                    if (registerResult == undefined) {
                      var result = {
                        "status": "False",
                        "message": "Required Field missing."
                      }

                      res.json(result);
                    } else {
                      res.json({
                        "status": "True", "message": "successfully Inserted.", "result": [registerResult],
                        "userID": registerResult.id
                      });
                    }
                  });
                }
              });

            }


          }

        });
      }
    }
  });
});
/*end signup*/

/*start loginviaotp api*/
app.post('/loginViaOtp', (req, res) => {
  var val = req.body.type;
  //console.log(isNaN(req.body.email));
  if (val == 'email') {
    var mailId = req.body.email;
    register.find({
      email: mailId
    }, (err, mailResult) => {
      if (err) res.json(err);
      else if (mailResult != 0) {
        var transporter = nodemailer.createTransport({
          // service: 'gmail',
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: 'mufthitech@gmail.com',
            pass: 'blackpearl@ms33'
          }
        });

        var otpVal = genOTP(1000, 9000);
        var mailOptions = {
          from: '"Aalap Team" <mufthitech@gmail.com>',
          to: mailId,
          subject: 'Receive Email From AALAP',
          /*text: 'That was easy!'*/
          html: '<h1>Hello</h1><p>Your OTP is : </p><b>' + otpVal + '</b>'
        };

        transporter.sendMail(mailOptions, (err, otpsend) => {
          if (err) {
            res.json(err);
          } else (otpsend.length != 0)
          {
            register.updateOne(
              {
                "email": mailId
              },
              {
                otpVerify: "Pending", otp: otpVal
              }, (err, otpUpdate) => {
                if (err) res.json(err);
                else {
                  var result = {
                    "status": "True",
                    "message": "OTP Send your email successfully."
                    , "result": [{
                      email: req.body.email
                    }]
                  }

                }
                res.json(result);
              });

          }
        });
      } else {
        var result = {
          "status": "False",
          "message": "May be your mailID is Wrong."
        }
        res.json(result);

      }
    });
  } else {
    var mbl = req.body.email
    register.find({
      mobile_no: mbl
    }, (err, mobileResult) => {
      // console.log(mobileResult);
      if (err) res.json(err);
      else if (mobileResult.length != 0) {
        var otpVal = genOTP(1000, 9000),

          msgResult = sendOTPtoMobile('91'+mbl, otpVal);
        console.log('msg details :', msgResult)
        if (!msgResult) {
          var result = {
            "message": "something went wrong while sending OTP to given number"
          }
          res.json(result);
          return false;
        }
        register.updateOne({ "mobile_no": mbl },
          {
            otpVerify: "Pending", otp: otpVal
          }, (err, otpResult) => {
            if (err) res.json(err);
            else {
              register.find({
                mobile_no: mbl
              }, (err, getResult) => {
                if (err) res.json(err);
                else {
                  var result = {
                    "status": "True",
                    "message": "OTP Send your mobile successfully."
                    , "result": [getResult]
                  }
                }
                res.json(result);

              });
            }
          });

      } else {
        var result = {
          "status": "False",
          "message": "Data not available"
        }
        res.json(result);

      }

    });
  }

});
/*stop loginviaotp api*/

/*start otp verify*/
app.post('/otpVerify', (req, res) => {
  var udata = req.body.email;
  var type = isNaN(req.body.email);
  if (type === true) {
    register.find({
      email: udata, otp: req.body.otp, otpVerify: 'Pending'
    }, (err, emailResult) => {
      //console.log(emailResult);
      if (err) res.json(err);
      else if (emailResult != 0) {
        register.updateOne(
          {
            "email": udata, "otp": req.body.otp
          },
          {
            otpVerify: "Verified"
          }, (err, uptresult) => {
            if (err) res.json(err);
            else {
              var result = {
                "status": "True",
                "result": "OTP Verified successfully."
              }
              res.json(result);
            }
          });
      } else {
        var result = {
          "status": "False",
          "result": "Your email id or OTP is wrong."
        }
        res.json(result);
      }

    });

  } else {
    register.find({
      mobile_no: udata, otp: req.body.otp, otpVerify: 'Pending'
    }, (err, mblResult) => {
      if (err) res.json(err);
      else if (mblResult != 0) {
        register.updateOne(
          {
            "mobile_no": udata, "otp": req.body.otp
          },
          {
            otpVerify: "Verified"
          }, (err, uptresult) => {
            if (err) res.json(err);
            else {
              var result = {
                "status": "True",
                "result": "OTP Verified successfully."
              }
              res.json(result);
            }
          });
      } else {
        var result = {
          "status": "False",
          "result": "Your mobile number or OTP is wrong."
        }
        res.json(result);
      }

    });

  }
});
/*end otp verification*/

/* login api start*/
app.post('/login', (req, res) => {
  var uname = req.body.email, pw = req.body.password;

  register.find({ $or: [ { email: uname }, { mobile_no: uname } ] }).then(emailVerify =>
    {
       if(emailVerify.length == 0) res.json({ "status": "False", "result": "Your Email or mobile number is wrong." });
       else
       register.find( { $and : [ { $or: [ { email: uname }, { mobile_no: uname } ] }, { $or: [ { password: pw }, { otp: pw } ] } ] } ).then(loginResult=>
        {
           if(loginResult.length == 0) res.json({  "status": "False", "result": "Your Password or Email is wrong."});
           else{
                  res.json({ "status": "True", "result": "You Loged Successfully", "userID": loginResult[0]['_id'] , "response": loginResult[0]   })
           }
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));

  

  // register.find({ $or: [{ email: uname }, { mobile_no: uname }]  }, (err, loginResult) => {
  //   if (err) {
  //     res.json(err);
  //   } else if (loginResult.length == 1) {
  //     register.find({
  //            /*password : pw*/$or: [{ password: pw }, { otp: pw }]
  //     }, (err, mobResult) => {
  //       if (err) { res.json(err); }
  //       else if (mobResult.length != 0) {
  //         console.log(mobResult[0]['_id']);
  //         var result = {
  //           "status": "True",
  //           "result": "You Loged Successfully",
  //           "userID": mobResult[0]['_id']
  //           , "response": mobResult

  //         }
  //         res.json(result);
  //       } else {
  //         var result = {
  //           "status": "False",
  //           "result": "Your Password is wrong."
  //         }
  //         res.json(result);
  //       }
  //     });
  //   } else {
  //     var result = {
  //       "status": "False",
  //       "result": "Your email or mobile number is wrong."
  //     }
  //     res.json(result);
  //   }

  // });
});

/*login api end*/

/*usersignupdetail API*/
app.post('/usersignupdetail', (req, res) => {
  var ID = req.body.userID;
  //console.log(ID);
  register.find({
    _id: ObjectId(ID)
  }, (err, UserList) => {
    if (err) res.json(err);
    else if (UserList != 0) {
      frdrequest.find({})
      var result = {
        "status": "True",
        "message": "Your UserList get successfully.",
        "Result": UserList

      }
      res.json(result);
    } else {
      var result = {
        "status": "False",
        "message": "No Data.",

      }
      res.json(result);
    }


  });

});
/*End usersignupdetail*/

/*email API */
/*app.post('/forgotPassword',function(req,res)
{ 
  var mailId = req.body.email;
  var type = isreq.body.email
    register.find({
      email : mailId
    },function(err,mailResult)
    {
      if(err) res.json(err);
      else if(mailResult != 0)
      {
        var transporter = nodemailer.createTransport({
        // service: 'gmail',
        host : 'smtp.gmail.com',
        port : 465,
        secure : true,
        auth: {
        user: 'mufthitech@gmail.com',
        pass: 'blackpearl@ms33'
        }
        });
         
         var otpVal = genOTP(1000,9000);
         var mailOptions = {
         from: '"Aalap Team" <mufthitech@gmail.com>',
         to: mailId,
         subject: 'Receive Email From Aalap',
         text: 'That was easy!'
         html: '<h1>Hello</h1><p>Your OTP is : </p><b>'+otpVal+'</b>'
         };

         transporter.sendMail(mailOptions, function(err,otpsend){
         if (err) {
          res.json(err);
         } else(otpsend.length != 0) 
         {
          

                register.updateOne(
          {
                       "email" : mailId
              },
              {
                  otpVerify: "Pending", otp : otpVal
              },function(err,otpUpdate)
              {
                if (err) res.json(err); 
                else{
                   var result = {
                         "status":"True",
                         "message" :"OTP Send your email successfully."
                         ,"result" : [ {
                          email : req.body.email
                         }]
                  }

                }
                res.json(result);
              });
         
         }
         });
      } else
      {
        var result ={
                  "status":"False",
                "message" :"May be your mailID is Wrong."
                }
      res.json(result);

    }
  });
   
});*/
/*end email API*/

/*Change Password API START*/
app.post('/changePassword', (req, res) => {
  var uname = req.body.email;

  register.find({
    $or: [{ email: uname }, { mobile_no: uname }]
  }, (err, result) => {
    if (err) res.json(err);
    else if (result.length != 0) {
      register.find({
        otpVerify: "Verified"
      }, (err, otpMatch) => {
        if (err) res.json(err);
        else {
          var type = isNaN(uname);
          if (type === true) {
            register.updateOne(
              { "email": uname },
              { password: req.body.password },
              (err, passwordUpdate) => {
                if (err) res.json(err);
                else (passwordUpdate.length != 0)
                {
                  var result = {
                    "status": "True",
                    "message": "Your Password Update successfully."
                  }
                }
                res.json(result);

              });
          } else {
            register.updateOne(
              { "mobile_no": uname },
              { password: req.body.password },
              (err, passwordUpdate) => {
                if (err) res.json(err);
                else (passwordUpdate.length != 0)
                {
                  var result = {
                    "status": "True",
                    "message": "Your Password Update successfully."
                  }
                }
                res.json(result);

              });
          }

        }
      });

    } else {
      var result = {
        "status": "False",
        "message": "First Update Your OTP."
      }
      res.json(result);
    }

  });
});

/*upload image*/
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
  }
});
/*end image upload*/
var upload = multer({ storage: storage });
/*api for upload image*/

app.post('/updateprofile', upload.array("pic", 6), (req, res) => {
  var ID = req.body.userID;
  var imgString = "";
  var imgname = req.files[0].filename;
  var len = req.files.length;

  for (var i = 0; i < req.files.length; i++) {
    if ((len - 1) == i) imgString += req.files[i].filename;
    else imgString += req.files[i].filename + ",";
  }

  var newage = getAge(req.body.dob);
  register.find({ _id: ObjectId(ID) }).then(userRes => {
    if (userRes.length == 0) res.json({ "status": "False", "message": "no user in this id" });
    register.updateOne({ "_id": ObjectId(ID) },
      {
        profilePic: imgString, dob: req.body.dob, age: newage,
        ageStatus: req.body.ageStatus ? req.body.ageStatus : '0',
        tagline: req.body.tagline ? req.body.tagline : null,
        country: req.body.country ? req.body.country : null,
        city: req.body.city ? req.body.city : null,
        gender: req.body.gender ? req.body.gender : null,
        genderStatus: req.body.gdrstatus ? req.body.gdrstatu : null
      }, (err, updatePic) => {
        if (err) res.json(err);
        else if (updatePic == undefined) res.json({ "status": "False", "message": "Required filed missing." });
        else (updatePic.length != 0)
        {
          var myname = userRes[0].screenName, imageurl = 'http://18.204.139.44/AalapApi/uploads/' + imgString, myuid = ID;

          var data = '{"uid":' + JSON.stringify(myuid) + ',"name":' + JSON.stringify(myname) + ',"avatar":' + JSON.stringify(imageurl) + '}';
          var options = {
            method: 'POST',
            url: 'https://api.cometchat.com/v1.8/users',
            headers: {
              appid: appID,
              apikey: apiKey,
              'content-type': 'application/json',
              accept: 'application/json'
            },
            body: data
          };

          request(options, function (error, response, body) {
            if (error) throw new Error(error);
            //else res.send(body);
          });

          var now = new Date();
          createDate = dateFormat(now, "dd-mm-yyyy hh:MM:ss TT");
          new prsnlDet({
            userID: ID,
            sexualOrientation: req.body.orientation ? req.body.orientation : null,
            orientationStatus: req.body.orntStatus ? req.body.orntStatus : null,
            marriagestatus: req.body.mrg ? req.body.mrg : null,
            mrgStatus: req.body.mgStatus ? req.body.mgStatus : null,
            hobbies: req.body.hobbies ? req.body.hobbies : null,
            occupation: req.body.occupation ? req.body.occupation : null,
            occupationStatus: req.body.occStatus ? req.body.occStatus : null,
            primaryLanguage: req.body.language ? req.body.language : null,
            lastseen: createDate,
            createdAt: createDate
          }).save((err, prslDetResult) => {
            if (err) res.json(err);
            else res.json({ "status": "True", "message": "Your personal details update successfully." });

          });

        }

      });
  }).catch(Error => console.log(Error));
});
/*end api*/

/*search api start*/
app.post('/searchFriend', (req, res) => {
  var val = req.body.name
  register.find({
    $or: [{ mobile_no: { $regex: val } }, { country: { $regex: val } }, { screenName: { $regex: val } }]
  }, (err, findResult) => {
    if (err) res.json(err);
    else if (findResult.length != 0) {
      var result = {
        "status": "True",
        "message": "your searched details.",
        "result": findResult
      }
      res.json(result);
    } else {
      var result = {
        "status": "False",
        "message": "No data found.",
        "result": []
      }
      res.json(result);
    }

  });

});
/*ens search api*/

/*send friend req api*/
app.post('/sendFriendReq', (req, res) => {
  var userID = req.body.userID;
  if(userID == null || undefined || "") res.json({"status" : "False", "message" : "must give a userid" });
  else if( req.body.receiverId == null || undefined || "") res.json({"status" : "False", "message" : "must give a receiver id" });
  else
  {
    frdrequest.find({
      $and: [{ senderId: userID }, { receiverId: req.body.receiverId }]
    }, (err, frdResult) => {
      if (err) res.json(err);
      else if (frdResult.length != 0) {
        var result = {
          "status": "False",
          "message": "You already send request to the person."
        }
        res.json(result);
      } else {
        frdrequest.find({
          $and: [{ senderId: req.body.receiverId }, { receiverId: req.body.userID }]
        }, (err, requestResult) => {
          if (err) res.json(err);
          else if (requestResult.length != 0) {
            var result = {
              "status": "False",
              "message": "You already have a request from this person."
            }
            res.json(result);
          } else {
            var now = Date();
            createDate = dateFormat(now, 'dd-mm-yyyy hh:MM:ss TT')
            new frdrequest({
              userid: userID,
              senderId: userID,
              receiverId: req.body.receiverId,
              reqStatus: "Pending",
              createdAt: createDate
            }).save((err, sendReq) => {
              if (err) res.json(err);
              else {
                var result = {
                  "status": "True",
                  "message": "request send."
                }
                res.json(result);
              }
            });
          }
        });
      }
    });
  }

});
/*end request api*/

/*accept frd request api start */
app.post('/acceptFrdRequest', (req, res) => {
  frdrequest.find({
    $and: [{ senderId: req.body.userID }, { receiverId: req.body.receiverId }]
  }, (err, acceptRequest) => {
    if (err) res.json(err);
    else if (acceptRequest.length != 0) {
      var now = new Date();
      createDate = dateFormat(now, 'dd-mm-yyyy hh:MM:ss TT');
      frdrequest.updateOne(
        {
          "senderId": req.body.userID, "receiverId": req.body.receiverId
        },
        {
          "reqStatus": req.body.status, "updateAt": createDate
        }, (err, updateResult) => {
          if (err) res.json(err);
          else if (req.body.status == 'Accept') {
            rooms.find({
              /*chatUSersId : req.body.userID , chatUSersId2 : req.body.receiverId*/
              chatUSersId: req.body.userID + "," + req.body.receiverId
            }, (err, roomResult) => {
              if (err) res.json(err);
              else if (roomResult.length == 0) {
                var now = new Date();
                createDate = dateFormat(now, 'dd-mm-yyyy hh:MM:ss TT');
                new rooms({
                  chatUSersId: req.body.userID + "," + req.body.receiverId,
                  //chatUSersId2 : req.body.receiverId,
                  createdAt: createDate
                }).save((err, roomCreateResult) => {
                  var result = {
                    "status": "True"
                    , "message": "Room created successfully."
                    , "result": [roomCreateResult]
                    , "roomID": roomCreateResult.id
                  }
                  res.json(result);
                });
              } else {
                var result = {
                  "status": "False"
                  , "message": "Already have a room."
                }
                res.json(result);

              }
            });

          }
          else {
            var result = {
              "status": "True",
              "message": "Rejected successfully."
            }
            res.json(result);
          }
        });
    } else {
      frdrequest.find({
        $and: [{ senderId: req.body.receiverId }, { receiverId: req.body.userID }]
      }, (err, acptResult) => {
        if (err) res.json(err);
        else if (acptResult.length != 0) {
          var now = new Date();
          createDate = dateFormat(now, 'dd-mm-yyyy hh:MM:ss TT');
          frdrequest.updateOne(
            {
              "senderId": req.body.receiverId, "receiverId": req.body.userID
            },
            {
              "reqStatus": req.body.status, "updateAt": createDate
            }, (err, updateResult) => {
              if (err) res.json(err);
              else if (req.body.status == 'Accept') {
                rooms.find({
                  //chatUSersId : req.body.receiverId , chatUSersId2 : req.body.userID
                  chatUSersId: req.body.receiverId + "," + req.body.userID
                }, (err, roomResult) => {
                  if (err) res.json(err);
                  else if (roomResult.length == 0) {
                    var now = new Date();
                    createDate = dateFormat(now, 'dd-mm-yyyy hh:MM:ss TT');
                    new rooms({
                      chatUSersId: req.body.receiverId + "," + req.body.userID,
                      //chatUSersId2 : req.body.userID,
                      createdAt: createDate
                    }).save((err, roomCreateResult) => {
                      var result = {
                        "status": "True"
                        , "message": "Room created successfully."
                        , "result": [roomCreateResult]
                        , "roomID": roomCreateResult.id
                      }
                      res.json(result);
                    });
                  } else {
                    var result = {
                      "status": "False"
                      , "message": "Already have a room."
                    }
                    res.json(result);

                  }
                });
              }
              else {
                var result = {
                  "status": "True",
                  "message": "Rejected successfully."
                }
                res.json(result);
              }
            });

        } else {
          var result = {
            "status": "False"
            , "message": "No data found."
          }
          res.json(result);
        }
      });

    }
  });

});
/*end api for accept frd request*/

/*updateonline status api start*/
app.post('/updateOnlinestatus', (req, res) => {
  ID = req.body.userID;
  register.find({
    _id: ObjectId(ID)
  }, (err, checkResult) => {
    if (err) res.json(err);
    else if (checkResult.length != 0) {
      var now = new Date();
      lastseen = dateFormat('dd-mm-yyyy hh:MM:ss TT');

      register.updateOne(
        {
          "_id": ObjectId(ID)
        }, {
        lastseen: lastseen, online: req.body.online
      }, (err, updateResult) => {
        if (err) res.json(err);
        else {
          var result = {
            "status": "True",
            "message": "Update successfully."
          }
          res.json(result);
        }
      });
    }
    else {
      var result = {
        "status": "False",
        "message": "No data found"
      }
      res.json(result);
    }
  });
});
/*end online status api*/

/*update read messages one by one api start*/
app.post('/updateReadMsgOnebyone', (req, res) => {
  messages.find({
    messageCustomId: req.body.messageCustomId
  }, (err, customRessult) => {
    if (err) res.json(err);
    else if (customRessult.length != 0) {
      messages.updateOne({
        "messageCustomId": req.body.messageCustomId
      }, {
        message_status: "read"
      }, (err, updateResult) => {
        if (err) res.json(err);
        else {
          var result = {
            "status": "True",
            "message": "Update successfully."
          }
          res.json(result);
        }
      });
    } else {
      var result = {
        "status": "False",
        "message": "No data found."
      }
      res.json(result);
    }
  });
});
/*end the api of update read messages one by one*/

/*update read for all msg api start */
app.post('/updateAllMsgRead', (req, res) => {
  messages.find({
    messagesBySender: req.body.messagesBySender
  }, (err, customRessult) => {
    if (err) res.json(err);
    else if (customRessult.length != 0) {
      messages.updateMany({
        "messagesBySender": req.body.messagesBySender
      }, {
        message_status: "read"
      }, (err, updateResult) => {
        if (err) res.json(err);
        else {
          var result = {
            "status": "True",
            "message": "Update successfully."
          }
          res.json(result);
        }
      });
    } else {
      var result = {
        "status": "False",
        "message": "No data found."
      }
      res.json(result);
    }
  });
});
/*end update all msg as read api*/

/*get full user details api start */
app.post('/usersList', (req, res) => {
  var uid = req.body.userID, userList = [], othersList = [], _id, screenName, profile_pic, country, city, lastseen, online, ConnectionStatus, connectList, remove = [];

  register.find({ _id: { "$ne": uid } }, { screenName: 1, profilePic: 1, country: 1, city: 1, lastseen: 1, online: 1 }).then(userResult => 
    {    
      
    if (userResult.length == 0) res.json({ "status": "False", "message": "No data found." });
    else 
    {
      frdrequest.find({ $or: [{ senderId: uid }, { receiverId: uid }], reqStatus: 'Accept' }, { senderId: 1, receiverId: 1 }).then(reqResult => {

        if (reqResult.length == 0) {
          res.json({ "status": "True", "message": "Get a  userlist", "usercount": userResult.length, "list": userResult });
        } else
         {
          reqResult.map(element => {
            if (element.senderId == uid) othersList.push({ otherid: element.receiverId })
            else othersList.push({ otherid: element.senderId })
          }) 
          //console.log('connected id',othersList)
          userResult.map(element=>
            {
               othersList.map(elm =>
                {
                  if(element._id == elm.otherid)
                  {
                     userList.push({
                      _id : element._id, screenName : element.screenName, profilePic : element.profile_pic, country : element.country,
                      city : element.city, lastseen : element.lastseen, online : element.online, ConnectionStatus : 'True'
                     })
                  }
                })
            })
            //console.log('connected users details',userList)
              othersList.map(Element=>
              {
                  let idx = userResult.findIndex(elem => {         
                          return elem._id == Element.otherid
                      }); 
                      remove.push({idx})
              })

            remove.map(Element=>
              {
                 userResult.splice(Element.idx, 1);
              })
              //console.log('other users ',userResult)
              userList = userList.concat(userResult);          
              
          // var result = signupUsers.map(function(el) {
          //   var o = Object.assign({}, el);
          //   o.isActive = true;
          //   return o;
          // })       

          res.json({ "status": "True", "message": "Get a  userlist", "usercount": userList.length, "list": userList });
        }

      }).catch(Error => console.log(Error));
    }
  }).catch(err => console.log(err));
});
/*end  the full user details api*/

/*msg count & list api start*/
app.post('/receivedMsgList', (req, res) => {
  messages.find({
    chatReceiverId: req.body.userID, message_status: 'sent'
  }, (err, msgResult) => {
    if (err) res.json(err);
    else if (msgResult.length != 0) {
      messages.countDocuments({
        chatReceiverId: req.body.userID, message_status: 'sent'
      }, (err, msgCount) => {
        if (err) res.json(err);
        else {
          var result = {
            "status": "True",
            "message": "message List",
            "Count": msgCount,
            "list": msgResult
          }
          res.json(result);
        }
      });
    } else {
      var result = {
        "status": "False",
        "message": "Np data found."
      }
      res.json(result);
    }
  });
});
/*msg count api end*/

/*friends list api start*/
app.post('/friendslist', (req, res) => {
  var uid = req.body.userID, UserArray = [];

  register.find({_id : ObjectId(uid)}).then(userResult=>
    {
        if(userResult.length == 0) res.json({ "status": "False", "message": "No data in this userid" });
        else{
          frdrequest.find({ $or: [{ senderId: uid }, { receiverId: uid }] , reqStatus: "Accept"})
          .then(frdlist=>
            {
                if(frdlist.length == 0) res.json({ "status": "False", "message": "No data in friends collection." });
                else{
                  frdlist.map(Element=>
                    {
                       if(Element.senderId == uid) UserArray.push({userId : Element.receiverId});
                       else  UserArray.push({userId : Element.senderId});
                    });

                    register.find({_id : {"$in" : UserArray.map(x=>x.userId)} },{ screenName: 1, profilePic: 1, country: 1, city: 1})
                    .then(userDetails=>
                      {
                        res.json({ "status": "True", "message": "friends list.", "details": userDetails });
                      }).catch(err=>console.log(err));
                }
            }).catch(err=>console.log(err));
        }
    }).catch(err=>console.log(err)); 
});
/*end friends list api*/

/*COUNTRY,city,hobbies,occupation,language Api start*/
app.post('/selectedOptionsList', (req, res) => {
  var val = req.body.value;
  switch (val) {
    case "Country":
      country.find({}).sort("countryName").exec((err, cnryList) => {
        if (err) res.json(err);
        else if (cnryList.length != 0) {
          var result = {
            "status": "True",
            "message": "Get the Country List"
            , "country": cnryList
          }
          res.json(result);
        } else {
          var result = {
            "status": "False",
            "message": "No data found."
          }
          res.json(result);
        }
      });
      break;

    case "City":
      cid = req.body._id;
      city.find({
        cnryID: cid
      }).sort('cityName').exec((err, cityResult) => {
        if (err) res.json(err);
        else if (cityResult.length != 0) {
          var result = {
            "status": "True",
            "message": "Get the City List"
            , "country": cityResult
          }
          res.json(result);
        } else {
          var result = {
            "status": "False",
            "message": "No data found."
          }
          res.json(result);
        }
      });
      break;

    case "Hobbies":
      hobbies.find({}).sort("hobbies").exec((err, hobResult) => {
        if (err) res.json(err);
        else if (hobResult.length != 0) {
          var result = {
            "status": "True",
            "message": "Get the Hobbies List"
            , "country": hobResult
          }
          res.json(result);
        } else {
          var result = {
            "status": "False",
            "message": "No data found."
          }
          res.json(result);
        }

      });
      break;

    case "Occupation":
      occupation.find({})/*.sort("occupation")*/.exec((err, occupationResult) => {
        if (err) res.json(err);
        else if (occupationResult.length != 0) {
          var result = {
            "status": "True",
            "message": "Get the Occupation List"
            , "country": occupationResult
          }
          res.json(result);
        } else {
          var result = {
            "status": "False",
            "message": "No data found."
          }
          res.json(result);
        }
      });
      break;

    case "Language":
      language.find({})/*.sort("language")*/.exec((err, languageResult) => {
        if (err) res.json(err);
        else if (languageResult.length != 0) {
          var result = {
            "status": "True",
            "message": "Get the Language List"
            , "country": languageResult
          }
          res.json(result);
        } else {
          var result = {
            "status": "False",
            "message": "No data found."
          }
          res.json(result);
        }
      });
      break;

    default:
      var result = {
        "status": "False",
        "message": "No data found."
      }
      res.json(result);
  }
})

/*End Api*/

// Country ,City Api
app.post('/roomsList', (req, res) => {
  var val = req.body.type;
  switch (val) {
    case "Country":
      rooms.find({
        type: 'Country'
      }, (err, countryList) => {
        if (err) res.json(err);
        else if (countryList.length != 0) {
          var result = {
            "status": "True",
            "message": "Fetch Country List",
            "country": countryList
          }
          res.json(result);
        } else {
          var result = {
            "status": "False",
            "message": "No data found."
          }
          res.json(result);
        }
      });
      break;
    case "City":
      rooms.find({ type: 'City' }, (err, citylist) => {
        if (err) res.json(err);
        else if (citylist.length != 0) {
          var result = {
            "status": "True",
            'message': "Fetch City List",
            "city": citylist
          }
          res.json(result);
        }
        else {
          var result = {
            "status": "False",
            "message": "No Data Found"
          }
          res.json(result);
        }
      });
      break;
    default:
      var result = {
        "status": "False",
        "message": "No data found."
      }
      res.json(result);

  }
});
// End Country ,City Api

/*Get friend request send/receive details api Start */
app.post('/getFriendRequestList', (req, res) => {
  var id = req.body.userID;
  frdrequest.find({
    $or: [{ senderId: id }, { receiverId: id }]
  }, (err, reqResult) => {
    if (err) res.json(err);
    else if (reqResult.length != 0) {
      frdrequest.find({
        senderId: id, reqStatus: "Pending"
      }, (err, sendReqResult) => {
        if (err) res.json(err);
        else if (sendReqResult != 0) {
          register.find({
            _id: { "$in": sendReqResult.map(x => x.receiverId) }
          }, { screenName: 1, profilePic: 1, tagline: 1 }, (err, recDetails) => {
            if (err) res.json(err);
            else {
              frdrequest.find({
                receiverId: id, reqStatus: "Pending"
              }, (err, recResult) => {
                if (err) res.json(err);
                else if (recResult.length != 0) {
                  register.find({
                    _id: { "$in": recResult.map(x => x.senderId) }
                  }, { screenName: 1, profilePic: 1, tagline: 1 }, (err, senderDetails) => {
                    if (err) res.json(err);
                    else {
                      var result = {
                        "status": 'True',
                        "message": "Get frdrequest details",
                        "send": recDetails,
                        "receive": senderDetails
                      }
                      res.json(result);

                    }
                  });
                } else {
                  var result = {
                    "status": 'True',
                    "message": "Get frdrequest details",
                    "send": recDetails
                  }
                  res.json(result);

                }
              });

            }
          })


        }
        else {
          frdrequest.find({
            receiverId: id, reqStatus: "Pending"
          }, (err, receiveReqResult) => {
            if (err) res.json(err);
            else {
              register.find({
                _id: { "$in": receiveReqResult.map(x => x.senderId) }
              }, {
                screenName: 1,
                tagline: 1,
                profilePic: 1
              }, (err, receiverDetails) => {
                if (err) res.json(err);
                else {
                  var result = {
                    "status": "True",
                    "message": "get friend request List.",
                    "receive": receiverDetails
                  }
                  res.json(result);
                }
              });

            }
          });
        }
      })

    }
    else {
      var result = {
        "status": "False",
        "message": "No data."
      }
      res.json(result);
    }
  })
})
/*Get friend request send/receive details api Start*/

/*message list api start */
app.post('/messageListBasedRoom', (req, res) => {
  var usrID = req.body.userID;
  var rcveID = req.body.receiverId;

  messages.find({
    $or: [{ $and: [{ chatSenderId: usrID }, { chatReceiverId: rcveID }] }, { $and: [{ chatSenderId: rcveID }, { chatReceiverId: usrID }] }]
  }, (err, findResult) => {
    if (err) res.json(err);
    else if (findResult.length != 0) {
      var result = {
        "status": "True",
        "message": "get message list.",
        "result": findResult
      }
      res.json(result);

    } else {
      var result = {
        "status": "False",
        "message": "No data found."
      }
      res.json(result);
    }
  });
});
/*message list api stop*/

/*get room id api start*/
app.post('/getRoomId', (req, res) => {
  var uid = req.body.userID,
    Id = req.body._id;

  rooms.find({
    $or: [{ $and: [{ chatUSersId: { $regex: uid } }, { chatUSersId: { $regex: Id } }] },
    { $and: [{ chatUSersId: { $regex: Id } }, { chatUSersId: { $regex: uid } }] }]
  }, (err, getRoom) => {
    //console.log(getRoom);
    if (err) res.json(err);
    else if (getRoom.length != 0) {
      var result = {
        "status": "True",
        "message": "get the room id",
        "roomId": getRoom[0]._id,
        "result": getRoom
      }
      res.json(result);

    } else {
      var result = {
        "status": "False",
        "message": "No rooms available"
      }
      res.json(result);
    }
  })



});

app.post('/getOTPDetails', (req, res) => {
  var mobileno = req.body.mobileno,
    otp = "5688";
  sendOTPtoMobile(mobileno, otp);
});

function sendOTPtoMobile(mbl, otp) {
  /*Testing For xml to json*/
  // let xmlString = `<?xml version="1.0" encoding="UTF-8"?>
  // <results>
  // <result>
  // <status>0</status>
  // <messageid>189080313110449602</messageid>
  // <destination>918667432856</destination>
  // </result>
  // </results>`;
  // let result = xmlParser.toJson(xmlString);
  // let resp = JSON.parse(xmlParser.toJson(xmlString))
  // console.log('JSON output', resp.results.result.status);
  let flag = true;
  let mobileno = mbl;
  let message = 'Your AALAP otp is ' + otp + ' for registration process';
  let request = 'http://193.105.74.159/api/v3/sendsms/plain?user=AALAP&password=Kap@user!123&sender=AALAP&SMSText=' + message + '&type=longsms&GSM=' + mobileno;


  http.get(request, (resp) => {
    let data = '';
    let flag = false;

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
      flag += true;

      //console.log('the chunk is:',chunk);
    });
    return flag;
    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      //console.log('the data:',data);
      return '0';
      // let data = JSON.parse(xmlParser.toJson(data));
      // console.log('the sms response:',data.results.result.status);
      // return resp.results.result.status;
      // let resp = JSON.parse(xmlParser.toJson(xmlString))
      // console.log('JSON output', resp.results.result.status);
      /*console.log('the json data:',JSON.stringify(data));
      console.log(JSON.stringify(data).explanation);*/
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
    return err.message;
  });

  return flag;

}


/*get message list api stop*/
function genOTP(min, max) {
  var OTP = Math.floor(min + Math.random() * max);
  return OTP;
}

/*app.get('/', (req, res) => {
res.send('Welcome to Aalap');
});*/

app.get('/', function (request, response) {
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(fs.readFileSync("./public/index.html"));
  response.end();
})

//Routing To Public Folder For Any Static Context
app.use(express.static(__dirname + '/public'));
console.log("Server Running At :" + port);
var io = require('socket.io').listen(app.listen(port));//Telling Express+Socket.io App To Listen To Port
io.sockets.on("connection", function (socket) {
  console.log("one user connected.");
  socket.emit("Start_Chat");
  socket.on("Send_msg", function (data) {
    //console.log('message', data);
    io.sockets.emit("msg", data);
    socket.join(data.roomsId)
    socket.broadcast.to(data.roomsId).emit('Start_Chat', data);
    new messages({
      content: data.content ? data.content : null,
      time: data.time ? data.time : null,
      roomsId: data.roomsId,
      message_status: data.message_status ? data.message_status : 'sent',
      chatUsersId: data.userID ? data.userID : null,
      type: data.type ? data.type : 'text',
      profile_pic: data.profile_pic ? data.profile_pic : null,
      username: data.username ? data.username : null,
      group_name: data.group_name ? data.group_name : null,
      receiver_name: data.receiver_name ? data.receiver_name : null,
      chatSenderId: data.chatSenderId ? data.chatSenderId : null,
      chatReceiverId: data.chatReceiverId ? data.chatReceiverId : null,
      sender_profile_pic: data.sender_profile_pic ? data.sender_profile_pic : null,
      date: data.date ? data.date : null,
      receiver_profile_pic: data.receiver_profile_pic ? data.receiver_profile_pic : null,
      messageCustomId: data.messageCustomId ? data.messageCustomId : null,
      messagesBySender: data.messagesBySender ? data.messagesBySender : null,
      onlineSenderStatus: data.onlineSenderStatus ? data.onlineSenderStatus : null,
      onlinereceiverStatus: data.onlinereceiverStatus ? data.onlinereceiverStatus : null
    }).save((err, insertMsgResult) => {
      console.log('message added');
    });
  });
  socket.on('is typing', (data) => {
    socket.broadcast.to(data.roomsId).emit('is typing', data);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('seen', (data) => {
    socket.join(data.roomsId)
    socket.broadcast.to(data.roomsId).emit('seen', data);
  });

});
