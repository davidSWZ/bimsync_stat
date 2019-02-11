const express    = require("express"),
      router     = express.Router(),
      user       = require("../../models/users"),
      session    = require('cookie-session'),
      mongoose   = require("mongoose"),
      bodyParser = require("body-parser"),
      passport   = require("passport"),
      request    = require("request"),
      env        = require('dotenv').config();


//===========================GETTING OAUTH TOKENS AND REDIRECT TO THE INDEX

router.get("/", passport.authenticate('oauth2'));

router.get("/redirect", passport.authenticate('oauth2'), function(req, res){
  req.flash("success", "Welcome to BIMSYNC Analytics, go on and try our dashboards.");
  res.redirect("/");
});


module.exports= router;
