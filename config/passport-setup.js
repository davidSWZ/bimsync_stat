const passport       = require("passport"),
      Oauth2Strategy = require("passport-oauth2"),
      env            = require('dotenv').config(),
      user           = require("../models/users"),
      request        = require("request"),
      mongoose       = require("mongoose");

passport.serializeUser(function (user, done){
  done(null, user._id);
});

passport.deserializeUser(function (id, done){
  user.findById(id).then(function(user){
    done(null, user);
  });
});

passport.use(
  new Oauth2Strategy({
    authorizationURL:"https://api.bimsync.com/oauth2/authorize",
    tokenURL:"https://api.bimsync.com/oauth2/token",
    clientID:process.env.clientID,
    clientSecret:process.env.client_Secret,
    callbackURL:process.env.redirect_URL
  }, function(accessToken, refreshToken, profile, done){
    //GET THE IDENTITY OF THE CURRENT USER WITH THE ACCESSTOKEN
          var oauth = "Bearer " + accessToken;
          var options = {
              url:"https://api.bimsync.com/v2/user",
              headers:{
                Authorization: oauth
              }
            };
          request.get(options, function(err, response, body){
              if(!err){
                var resultUser = JSON.parse(body);
                // console.log(resultUser);
    // CHECK IF THE USER ALREADY EXISTS
                user.find({username:resultUser.username}, function (err, currentUser){
    //IF NOT, SAVE THIS NEW USER
                  if(!currentUser.length){
                    console.log("this user is new, we create his account...");
                    user.create(
                      { id: resultUser.id,
                        name: resultUser.name,
                        username: resultUser.username,
                        access_token: accessToken,
                        refresh_token: refreshToken
                      }, function (err, createdUser) {
                          if (err) {
                            return handleError(err);
                          } else {
                            console.log("The user is created and obtained an authorization!");
                            done(err, createdUser);
                          }
                        }
                      )
                  } else {
    //IF THE USER ALREADY EXISTS
                    console.log("The user already exists, we update his authorization...");
                    var optionsRefresh = {
                      url: "https://api.bimsync.com/oauth2/token?grant_type=refresh_token&refresh_token="+currentUser[0].refresh_token+"&client_id="+process.env.clientID+"&client_secret="+process.env.client_Secret+"&redirect_uri="+process.env.redirect_URL,
                      headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                               }
                    };
                    function callbackRefresh (err, response, bodyRefresh){
                      var resultRefresh = JSON.parse(bodyRefresh);
                      if (!err && response.statusCode == 200) {
                        user.findByIdAndUpdate(
                            currentUser[0]._id,
                            {
                             access_token: resultRefresh.access_token,
                             refresh_token: resultRefresh.refresh_token
                            }, {new:true},function (err, updatedOauth){
                              console.log("Authorization updated!");
                              done(err, updatedOauth);
                         })
                      } else {
                        console.log(err);
                      };

                    };
                    request.post(optionsRefresh, callbackRefresh);
                  }
                });
              }
          });
}));
