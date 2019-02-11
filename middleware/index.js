const session    = require('cookie-session');

//Créer l'objet qui sera exporté
var middlewareObj = {};

//Ajoute la fonction middleware à l'objet exporté
middlewareObj.isLoggedIn = function(req, res, next){
  if(req.user){
    return next();
  }else{
    req.flash("error", "You are not logged in yet, please connect to your BIMSYNC account first!");
    res.redirect("/");

  }
};

module.exports = middlewareObj;
