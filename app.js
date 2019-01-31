//===================Import FRAMEWORKS et LIBRAIRIES=====================
const express    = require("express"),
      app        = express(),
      request    = require("request"),
      mongoose   = require("mongoose"),
      oauths     = require("./models/oauth"),
      user       = require("./models/users"),
      session    = require('cookie-session'),
      bodyParser = require("body-parser"),
      passport   = require("passport"),
      env        = require('dotenv').config();

//===================PARAMETRAGE APP ====================================

//Utilisation d'ejs comme moteur de page web
app.set("view engine", "ejs");

//Utilisation du dossier public pour les élements statics (css, jss etc)
app.use(express.static(__dirname + '/public'));

//Utilisation de body parser pour convertir la réponse des requêtes
app.use(bodyParser.urlencoded({extended:true}));

//Paramétrage de la session utilisateur
app.use(session({
  secret: 'bimsync secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

//Utiliser session.auth comme référence lorsque l'on appelle sessionOauth dans une page ejs
app.use(function(req,res,next){
    res.locals.sessionOauth =session.auth;
    next();
});

//Paramétrage du chemin pour se connecter à MongoDB
//Utiliser l'url mongoDB en fonction de l'environnement, si pas d'environnement envoyer vers localhost
var url = process.env.DATABASEURL || 'mongodb://localhost/bimsync_stat';
mongoose.connect(url ,{ useNewUrlParser: true });

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
                console.log("this user is new, we create his account...")
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
                                  console.log("The user is created and obtained an authorization!");
                                  session.auth = createdOauth.access_token;
                                }
                              })
                            }
                          });
                      }
                     }
                );
              } else {
//IF THE USER ALREADY EXISTS
                console.log("The user already exists, we update his authorization...");
                var optionsRefresh = {
                  // url: "https://api.bimsync.com/oauth2/token?grant_type=refresh_token&refresh_token="+currentUser[0].oauth.refresh_token+"&client_id="+clientID+"&client_secret="+client_Secret+"&redirect_uri=http://localhost:3000/oauth/redirect",
                  url: "https://api.bimsync.com/oauth2/token?grant_type=refresh_token&refresh_token="+currentUser[0].oauth.refresh_token+"&client_id="+clientID+"&client_secret="+client_Secret+"&redirect_uri=https://bimsync-analytics.herokuapp.com/oauth/redirect",

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
                          console.log("Authorization updated!");
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
app.get("/projects", isLoggedIn, function (req, res){
  var oauth = "Bearer " + session.auth;
  var options = {
    url:"https://api.bimsync.com/v2/projects",
    headers:{
      Authorization: oauth
    }
  };
  request.get(options, function(err, response, body){
    if(!err){
      var result = JSON.parse(body);
      var datas = [];
      var labels = [];
      var backgroundColors = [];
      var borderColors = [];

      var fn = function asyncGetRevisions(i){
        // Setting URL and headers for request
              labels.push(i.name);
              backgroundColors.push("#7386D5");
              borderColors.push('rgba(140,99,132,1)');
               var modelOptions = {
                 url:"https://api.bimsync.com/v2/projects/"+ i.id +"/revisions",
                 headers:{
                   Authorization: oauth
                 }
               };
             	// Return new promise
             	return new Promise(function(resolve, reject) {
             		// Do async job
             		request.get(modelOptions, function(err, resp, modelBody) {
             			if (err) {
             				reject(err);
             			} else {
                    var models = JSON.parse(modelBody);
             				resolve(models.length);
             			}
             		});
             	});
      };

      // map over forEach since it returns
      var actions = result.map(fn); // run the function over all items
      // we now have a promises array and we want to wait for it
      var resultArray = Promise.all(actions); // pass array of promises

      resultArray.then(data =>{
            console.log(labels);
            res.render("projects", {
              result:result ,
              labels:labels ,
              datas:data ,
              backgroundColors:backgroundColors ,
              borderColors:borderColors
            })
        }
      );
    }
    else{
      console.log(err);
    }
  });
});

app.get("/logout", function(req,res){
  console.log(session.auth);
  session.auth=null;
  console.log(session.auth);
  res.redirect("/");
});

app.post("/projects/models", function(req, res){
  res.send(req.body);
});

//=======MIDDLEWARE=========
function isLoggedIn(req, res, next){
  if(session.auth){
    console.log(session.auth);
    return next();
  }else{
    console.log("no user");
    res.redirect("/");
  }
};
app.listen(process.env.PORT || 3000, process.env.IP, function(){
  console.log("the app run...");
});
