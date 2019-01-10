const express = require("express"),
      app = express(),
      request = require("request"),
      mongoose = require("mongoose"),
      oauth = require("./models/oauth");

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
    console.log(response);
    if (!err && response.statusCode == 200) {
//PREPARE TO SAVE THE TOKEN INTO MONGODB
      var result = JSON.parse(body);
      var access_token = result.access_token;
      var refresh_token = result.refresh_token;
      var token_type = result.token_type;
      var expires_in = result.expires_in;
//SAVE INTO MONGODB
      oauth.create(
        { access_token: access_token,
          refresh_token: refresh_token,
          token_type: token_type,
          expires_in: expires_in
        }, function (err, oauth) {
  if (err) {
    return handleError(err);
  }else{
    console.log(oauth);
  }
});
      res.redirect("/");
    }else{
      console.log(err);
    }
  };

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
