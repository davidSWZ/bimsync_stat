//===================Import FRAMEWORKS et LIBRAIRIES============================
const express       = require("express"),
      app           = express(),
      request       = require("request"),
      mongoose      = require("mongoose"),
      user          = require("./models/users"),
      cookieSession = require('cookie-session'),
      bodyParser    = require("body-parser"),
      passport      = require("passport"),
      passportSetup = require("./config/passport-setup"),
      env           = require('dotenv').config(),
      flash         = require("connect-flash");

//===================PARAMETRAGE APP ===========================================

//Utilisation d'ejs comme moteur de page web
app.set("view engine", "ejs");

//Utilisation du dossier public pour les élements statics (css, jss etc)
app.use(express.static(__dirname + '/public'));

//Utilisation de body parser pour convertir la réponse des requêtes
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//Paramétrage de la session utilisateur
app.use(cookieSession({
  secret:process.env.secret,
  keys:[process.env.cookieKey],
  cookie:{
    maxAge:59*60*1000
  }
}));

//Initialisation de passport et utilisation de la session de passport
app.use(passport.initialize());
app.use(passport.session());

//Utilisation des messages flash
app.use(flash());

//Utiliser session.auth comme référence lorsque l'on appelle sessionOauth dans
//une page ejs
app.use(function(req,res,next){
    res.locals.user =req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//=====================MONGODB==================================================
//Utiliser l'url mongoDB en fonction de l'environnement, si pas d'environnement
//envoyer vers localhost
var url = process.env.DATABASEURL;
mongoose.connect(url ,{ useNewUrlParser: true });

//===========================IMPORTE LES ROUTES=================================
const indexRoute    = require("./routes/index"),
      oauthRoute    = require("./routes/oauths/oauths"),
      logoutRoute   = require("./routes/oauths/logout"),
      projectsRoute = require("./routes/requests/projects");

//===========================DECLARE LES ROUTES=================================
app.use("/", indexRoute);
app.use("/oauth", oauthRoute);
app.use("/logout", logoutRoute);
app.use("/projects", projectsRoute);

//===========================DEFINITION DU PORT ET DE L'IP======================
app.listen(process.env.PORT, process.env.IP, function(){
  console.log("the app run...");
});
