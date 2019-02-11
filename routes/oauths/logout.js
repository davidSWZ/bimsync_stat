const express = require("express");
      router = express.Router(),
      session    = require('cookie-session');


router.get("/", function(req,res){
//supprime le token et la session
  req.flash("success", "Good by, we hope to see you soon!")
  req.logout();
//redirige sur la page d'accueil du site
  res.redirect("/");
});

module.exports = router;
