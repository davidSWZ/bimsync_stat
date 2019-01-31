//===================Import FRAMEWORKS et LIBRAIRIES============================
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

//===================PARAMETRAGE APP ===========================================

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

//Utiliser session.auth comme référence lorsque l'on appelle sessionOauth dans
//une page ejs
app.use(function(req,res,next){
    res.locals.sessionOauth =session.auth;
    next();
});

//=====================MONGODB==================================================
//Utiliser l'url mongoDB en fonction de l'environnement, si pas d'environnement
//envoyer vers localhost
var url = process.env.DATABASEURL || 'mongodb://localhost/bimsync_stat';
mongoose.connect(url ,{ useNewUrlParser: true });

//===========================IMPORTE LES ROUTES=================================
const indexRoute    = require("./routes/index"),
      oauthRoute    = require("./routes/oauths/oauths"),
      logoutRoute   = require("./routes/oauths/logout"),
      projectsRoute = require("./routes/requests/projects");

//===========================DECLARE LES ROUTES=================================
app.use("/", indexRoute);
app.use("/oauth/redirect", oauthRoute);
app.use("/logout", logoutRoute);
app.use("/projects", projectsRoute);

//===========================DEFINITION DU PORT ET DE L'IP======================
app.listen(process.env.PORT, process.env.IP, function(){
  console.log("the app run...");
});
