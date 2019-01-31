const express = require("express");
      router = express.Router();

router.get("/", function(req,res){
//supprime le token et la session
  session.auth=null;
//redirige sur la page d'accueil du site
  res.redirect("/");
});

module.exports = router;
