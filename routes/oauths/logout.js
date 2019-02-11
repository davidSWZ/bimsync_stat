const express = require("express");
      router = express.Router(),
      session    = require('cookie-session');


router.get("/", function(req,res){
//supprime le token et la session
  req.logout();
//redirige sur la page d'accueil du site
  res.redirect("/");
});

module.exports = router;
