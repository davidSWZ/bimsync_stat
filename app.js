const express   = require("express"),
      app       = express(),
      request   = require("request"),
      mongoose  = require("mongoose"),
      oauths     = require("./models/oauth"),
      user      = require("./models/users");

app.set("view engine", "ejs");

mongoose.connect('mongodb://localhost/bimsync_stat', { useNewUrlParser: true });

//PERSONAL CLIENT CODE (DO NOT SEND ON GITHUB)
const clientID = "eUROn8VE4OBNoYb";
const client_Secret = "R5trhSgAM4nZexn";

//INDEX
app.get("/", function(req, res){
  res.render("connection");
});

//GETTING OAUTH TOKENS AND REDIRECT TO THE INDEX
app.get("/oauth/redirect", function(req, res){
  const requestToken = req.query.code;
  var options = {
    url: "https://api.bimsync.com/oauth2/token?grant_type=authorization_code&code="+requestToken+"&client_id="+clientID+"&client_secret="+client_Secret+"&redirect_uri=http://localhost:3000/oauth/redirect",
    headers: {
              "Content-Type": "application/x-www-form-urlencoded",
             }
  };

  function callback (err, response, body){
//IF NO ERROR PREPARE TO SAVE THE TOKEN INTO MONGODB
    if (!err && response.statusCode == 200) {
      var result = JSON.parse(body);
      var access_token = result.access_token;
      // var refresh_token = result.refresh_token;
      // var token_type = result.token_type;
      // var expires_in = result.expires_in;
//SAVE INTO MONGODB
      oauths.create(
        { access_token: result.access_token,
          refresh_token: result.refresh_token,
          token_type: result.token_type,
          expires_in: result.expires_in
        }, function (err, oauth) {
            if (err) {
              return handleError(err);
            }else{
              console.log(oauth);
            }
           });
//GET THE IDENTITY OF THE CURRENT USER
        var oauth = "Bearer " + access_token;
        var options = {
          url:"https://api.bimsync.com/v2/user",
          headers:{
            Authorization: oauth
          }
        }
        request.get(options, function(err, response, body){
          if(!err){
            var resultUser = JSON.parse(body);

            user.create(
              { id: resultUser.id,
                name: resultUser.name,
                username: resultUser.username,
              }, function (err, user) {
                  if (err) {
                    return handleError(err);
                  }else{
                    console.log(user);
                  }
                 });

          }
          else{
            console.log(err);
          }
        });
//THEN REDIRECT TO THE HOME PAGE
      res.redirect("/");
    }else{
      console.log(err);
    }
  };

// LAUNCH THE REQUEST TO
// - GET ACCESS TOKEN, SAVE IT,
// - GET THE CURRENT USER, SAVE IT,
// - LINK THE USER AND THE TOKEN
// - GET BACK TO THE HOME PAGE GIVING THE NAME OF THE USER
  request.post(options, callback);
});

//SHOW THE PROJECTS OF THE USER
app.get("/projects", function (req, res){
  var oauth = "Bearer " + "Wj4Kh0tlmxRMLjcGxQTPnO";
  var options = {
    url:"https://api.bimsync.com/v2/projects",
    headers:{
      Authorization: oauth
    }
  }
  request.get(options, function(err, response, body){
    if(!err){
      res.send(body);
    }
    else{
      console.log(err);
    }
  })
});


app.listen(3000, process.env.IP, function(){
  console.log("the app run...");
});

//
//
// User submits credentials
// Express handles /login POST request from client in a route handler
// /login POST handler requests an access token from an OAuth 2 provider
// Access token needs to be stored and an associated cookie (signed) sent back in response to client
// In all further api requests from the client, if cookie is present, corresponding token is retrieved from store server side and used as a bearer token header for ongoing request to separate endpoint.
