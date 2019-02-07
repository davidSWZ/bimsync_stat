const express    = require("express"),
      router     = express.Router(),
      user       = require("../../models/users"),
      oauths     = require("../../models/oauth"),
      session    = require('cookie-session'),
      mongoose   = require("mongoose"),
      bodyParser = require("body-parser"),
      request    = require("request"),
      env        = require('dotenv').config();


//===========================GETTING OAUTH TOKENS AND REDIRECT TO THE INDEX
router.get("/", function(req, res){
  const requestToken = req.query.code;
  var options = {
    url: "https://api.bimsync.com/oauth2/token?grant_type=authorization_code&code="+requestToken+"&client_id="+process.env.clientID+"&client_secret="+process.env.client_Secret+"&redirect_uri="+process.env.redirect_URL,
    headers: {
              "Content-Type": "application/x-www-form-urlencoded",
             }
  };

  function callback (err, response, body){
//IF NO ERROR GET THE TOKEN
      if (!err && response.statusCode == 200) {
        var result = JSON.parse(body);
        var access_token = result.access_token;

        session.auth = access_token;
        session.refresh_auth = result.refresh_token;

        res.redirect("/");
    } else {
      console.log(err);
    }
  };
// LAUNCH THE REQUEST
  request.post(options, callback);
});

module.exports= router;





// const express    = require("express"),
//       router     = express.Router(),
//       user       = require("../../models/users"),
//       oauths     = require("../../models/oauth"),
//       session    = require('cookie-session'),
//       mongoose   = require("mongoose"),
//       bodyParser = require("body-parser"),
//       request    = require("request"),
//       env        = require('dotenv').config();
//
//
// //===========================GETTING OAUTH TOKENS AND REDIRECT TO THE INDEX
// router.get("/", function(req, res){
//   const requestToken = req.query.code;
//   var options = {
//     url: "https://api.bimsync.com/oauth2/token?grant_type=authorization_code&code="+requestToken+"&client_id="+process.env.clientID+"&client_secret="+process.env.client_Secret+"&redirect_uri="+process.env.redirect_URL,
//     headers: {
//               "Content-Type": "application/x-www-form-urlencoded",
//              }
//   };
//   function callback (err, response, body){
// //IF NO ERROR GET THE TOKEN
//     if (!err && response.statusCode == 200) {
//       var result = JSON.parse(body);
//       var access_token = result.access_token;
// //GET THE IDENTITY OF THE CURRENT USER WITH THE TOKEN
//       var oauth = "Bearer " + access_token;
//       var options = {
//           url:"https://api.bimsync.com/v2/user",
//           headers:{
//             Authorization: oauth
//           }
//         };
//       request.get(options, function(err, response, body){
//           if(!err){
//             var resultUser = JSON.parse(body);
// // CHECK IF THE USER ALREADY EXISTS
//             user.find({username:resultUser.username}).populate("oauth").exec(function (err, currentUser){
// //IF NOT, SAVE THIS NEW USER
//               if(!currentUser.length){
//                 console.log("this user is new, we create his account...")
//                 user.create(
//                   { id: resultUser.id,
//                     name: resultUser.name,
//                     username: resultUser.username,
//                   }, function (err, createdUser) {
//                       if (err) {
//                         return handleError(err);
//                       } else {
// //THEN SAVE THE OAUTH
//                         oauths.create(
//                           { access_token: result.access_token,
//                             refresh_token: result.refresh_token,
//                             token_type: result.token_type,
//                             expires_in: result.expires_in
//                           }, function (err, createdOauth) {
//                             if (err) {
//                               return handleError(err);
// //THEN ASSOCIATE THIS OAUTH TO THE USER
//                             } else {
//                               user.findOneAndUpdate({username:resultUser.username},{oauth:createdOauth}, function(err, foundUser){
//                                 if(err){
//                                   console.log(err);
//                                 } else {
//                                   console.log("The user is created and obtained an authorization!");
//                                   session.auth = createdOauth.access_token;
//                                 }
//                               })
//                             }
//                           });
//                       }
//                      }
//                 );
//               } else {
// //IF THE USER ALREADY EXISTS
//                 console.log("The user already exists, we update his authorization...");
//                 var optionsRefresh = {
//                   url: "https://api.bimsync.com/oauth2/token?grant_type=refresh_token&refresh_token="+currentUser[0].oauth.refresh_token+"&client_id="+process.env.clientID+"&client_secret="+process.env.client_Secret+"&redirect_uri="+process.env.redirect_URL,
//                   headers: {
//                             "Content-Type": "application/x-www-form-urlencoded"
//                            }
//                 };
//                 function callbackRefresh (err, response, bodyRefresh){
//                   var resultRefresh = JSON.parse(bodyRefresh);
//                   if (!err && response.statusCode == 200) {
//                     oauths.findByIdAndUpdate(
//                         currentUser[0].oauth._id,
//                         {
//                          access_token: resultRefresh.access_token,
//                          refresh_token: resultRefresh.refresh_token
//                        }, {new:true},function (err, updatedOauth){
//                           console.log("Authorization updated!");
//                           session.auth = updatedOauth.access_token;
//                      })
//                   } else {
//                     console.log(err);
//                   };
//
//                 };
//                 request.post(optionsRefresh, callbackRefresh);
//               }
//             });
//           }
//       });
//       res.redirect("/");
//     } else {
//       console.log(err);
//     }
//   };
// // LAUNCH THE REQUEST
//   request.post(options, callback);
// });
//
// module.exports= router;
