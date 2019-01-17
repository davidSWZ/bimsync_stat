const express   = require("express"),
      app       = express(),
      request   = require("request"),
      mongoose  = require("mongoose"),
      oauths    = require("./models/oauth"),
      user      = require("./models/users"),
      session   = require('express-session'),
      bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
  secret: 'bimsync secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

mongoose.connect('mongodb://localhost/bimsync_stat', { useNewUrlParser: true });

//PERSONAL CLIENT CODE (DO NOT SEND ON GITHUB)
const clientID = "eUROn8VE4OBNoYb";
const client_Secret = "R5trhSgAM4nZexn";

//===========================INDEX
app.get("/", function(req, res){
  res.render("connection");
});

//===========================GETTING OAUTH TOKENS AND REDIRECT TO THE INDEX
app.get("/oauth/redirect", function(req, res){
  const requestToken = req.query.code;
  var options = {
    url: "https://api.bimsync.com/oauth2/token?grant_type=authorization_code&code="+requestToken+"&client_id="+clientID+"&client_secret="+client_Secret+"&redirect_uri=http://localhost:3000/oauth/redirect",
    headers: {
              "Content-Type": "application/x-www-form-urlencoded",
             }
  };
  function callback (err, response, body){
//IF NO ERROR GET THE TOKEN
    if (!err && response.statusCode == 200) {
      var result = JSON.parse(body);
      var access_token = result.access_token;
//GET THE IDENTITY OF THE CURRENT USER WITH THE TOKEN
      var oauth = "Bearer " + access_token;
      var options = {
          url:"https://api.bimsync.com/v2/user",
          headers:{
            Authorization: oauth
          }
        };
      request.get(options, function(err, response, body){
          if(!err){
            var resultUser = JSON.parse(body);
// CHECK IF THE USER ALREADY EXISTS
            user.find({username:resultUser.username}).populate("oauth").exec(function (err, currentUser){
//IF NOT, SAVE THIS NEW USER
              if(!currentUser.length){
                user.create(
                  { id: resultUser.id,
                    name: resultUser.name,
                    username: resultUser.username,
                  }, function (err, createdUser) {
                      if (err) {
                        return handleError(err);
                      } else {
//THEN SAVE THE OAUTH
                        oauths.create(
                          { access_token: result.access_token,
                            refresh_token: result.refresh_token,
                            token_type: result.token_type,
                            expires_in: result.expires_in
                          }, function (err, createdOauth) {
                            if (err) {
                              return handleError(err);
//THEN ASSOCIATE THIS OAUTH TO THE USER
                            } else {
                              user.findOneAndUpdate({username:resultUser.username},{oauth:createdOauth}, function(err, foundUser){
                                if(err){
                                  console.log(err);
                                } else {
                                  console.log("The user obtains a oauth");
                                  session.auth = createdOauth.access_token;
                                  console.log(session);
                                }
                              })
                            }
                          });
                      }
                     }
                );
              } else {
//IF THE USER ALREADY EXISTS
                console.log("The User already exists, his oauth is: "+ currentUser[0].oauth);
                var optionsRefresh = {
                  url: "https://api.bimsync.com/oauth2/token?grant_type=refresh_token&refresh_token="+currentUser[0].oauth.refresh_token+"&client_id="+clientID+"&client_secret="+client_Secret+"&redirect_uri=http://localhost:3000/oauth/redirect",
                  headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                           }
                };
                function callbackRefresh (err, response, bodyRefresh){
                  var resultRefresh = JSON.parse(bodyRefresh);
                  if (!err && response.statusCode == 200) {
                    oauths.findByIdAndUpdate(
                        currentUser[0].oauth._id,
                        {
                         access_token: resultRefresh.access_token,
                         refresh_token: resultRefresh.refresh_token
                       }, {new:true},function (err, updatedOauth){
                          console.log("Access token mis à jour...");
                          session.auth = updatedOauth.access_token;
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
      res.redirect("/");
    } else {
      console.log(err);
    }
  };
// LAUNCH THE REQUEST
  request.post(options, callback);
});

//===================SHOW THE PROJECTS OF THE USER
app.get("/projects", function (req, res){
  var oauth = "Bearer " + session.auth;
  var options = {
    url:"https://api.bimsync.com/v2/projects",
    headers:{
      Authorization: oauth
    }
  }
  request.get(options, function(err, response, body){
    if(!err){
      var result = JSON.parse(body)
      res.render("projects", {result:result});
    }
    else{
      console.log(err);
    }
  })
});

app.post("/projects/models", function(req, res){
  res.send(req.body);
});

app.listen(3000, process.env.IP, function(){
  console.log("the app run...");
});
