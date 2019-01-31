const session    = require('cookie-session');

//Créer l'objet qui sera exporté
var middlewareObj = {};

//Ajoute la fonction middleware à l'objet exporté
middlewareObj.isLoggedIn = function(req, res, next){
  if(session.auth){
    console.log(session.auth);
    return next();
  }else{
    console.log("no user");
    res.redirect("/");
  }
};

module.exports = middlewareObj;
