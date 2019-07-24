const express    = require("express"),
      router     = express.Router(),
      middleware = require("../../middleware"),
      request    = require("request"),
      bodyParser = require("body-parser"),
      session    = require('cookie-session');


router.get("/", middleware.isLoggedIn, function (req, res){
  var labelsProjects = [];
  var allUsers = [];
  var oauth = "Bearer " + req.user.access_token;

  //Récupérer la liste des projets de l'utilisateur
    function getProjects(){
      var options = {
        url:"https://api.bimsync.com/v2/projects",
        headers:{
          Authorization: oauth,
        },
      };
      return new Promise (function(resolve, reject){
        request.get(options, function(err, response, body){
          if(!err){
              var projects = JSON.parse(body);
              resolve(projects);
          } else {
            console.log(err);
            res.redirect("/")
          }
        })
      })
    }

    //Fonction pour récupérer la liste des utilisateurs sur un projet
    var fnUsers = function getUsers(i){
        // var oauth = "Bearer " + req.user.access_token;
        var options = {
          url:"https://api.bimsync.com/v2/projects/"+ i.id +"/members",
          headers:{
            Authorization: oauth
          }
        };
        return new Promise (function(resolve, reject){
          request.get(options, function(err, response, body){
            if(!err){
                var users = JSON.parse(body);
                allUsers.push(users);
                labelsProjects.push(i.name);
                resolve();
            } else {
              reject(err);
              res.redirect("/")
            }
          })
        })
    }

    //Joue la fonction getUsers sur tous les projets de l'utilisateur
    function getAllUsers(){
      return new Promise(function(resolve, reject){
        var getProjectsPromise = getProjects();
        getProjectsPromise.then(function(projects){
          var getAllUSers = projects.map(fnUsers);
          var resultArray = Promise.all(getAllUSers);
          resultArray.then(function(){
            resolve();
          })
        })
      })
    }

    //Fonction principale
    function main(){
      var getBackAllUsers = getAllUsers();
        getBackAllUsers.then(function(){
          res.render("requests/users", {
            labelsProjects:labelsProjects ,
            allUsers: allUsers
          })
        })
    }

//Déclenche la fonction principale
main();

});

module.exports = router;
