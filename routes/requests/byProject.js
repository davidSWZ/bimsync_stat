const express    = require("express"),
      router     = express.Router(),
      middleware = require("../../middleware"),
      request    = require("request"),
      bodyParser = require("body-parser"),
      session    = require('cookie-session');


// Affiche la page vierge avec le formulaire proposant
// tout les projets de l'utilisateur dans un select
router.get("/", middleware.isLoggedIn, function(req, res){
  var oauth = "Bearer " + req.user.access_token;
  var options = {
    url:"https://api.bimsync.com/v2/projects",
    headers:{
      Authorization: oauth
    }
  };
  request.get(options, function(err, response, body){
    if(!err){
      var projects = JSON.parse(body);
      res.render("requests/by_project", {
        projects:projects,
        usersNb:null,
        projectLastUpdate:null,
        datamodel:null,
        labelmodel:null ,
        backgroundColorsmodel:null ,
        borderColorsmodel:null ,
      });
    } else {
      console.log(err);
      res.redirect("/")
    }
  })
});


// Une fois que l'utilisateur a choisi le projet on génère le tableau de
// bord de ce projet
router.post("/", middleware.isLoggedIn, function(req, res){

  //Déclare les variables utiles pour Charts.js
  var labelmodel = [];
  var datamodel = [];
  var backgroundColorsmodel = [];
  var borderColorsmodel = [];
  var topicsList = [];
  var projectName = null;


//Récupère la liste des projets de l'utilisateur
//Utile pour réafficher la liste des projets dans
//le formulaire du haut de la page
  function getProjects(){
    var oauth = "Bearer " + req.user.access_token;
    var options = {
      url:"https://api.bimsync.com/v2/projects",
      headers:{
        Authorization: oauth
      }
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

// Récupère le nombre d'utilisateurs du projet choisi
  function getUsers(){
      var oauth = "Bearer " + req.user.access_token;
      var options = {
        url:"https://api.bimsync.com/v2/projects/"+ req.body.project_id +"/members",
        headers:{
          Authorization: oauth
        }
      };
      return new Promise (function(resolve, reject){
        request.get(options, function(err, response, body){
          if(!err){
              var users = JSON.parse(body);
              for( var i = 0; i < users.length; i++){
                if ( users[i].user.username === null) {
                  users.splice(i, 1);
                  i--;
                }
              }
              resolve(users);
          } else {
            console.log(err);
            res.redirect("/")
          }
        })
      })
  }

//Récupère la date de la dernière mise à jour du projet choisi et le nom du projet
  function getProjectLastUpdate(){
    var oauth = "Bearer " + req.user.access_token;
    var options = {
      url:"https://api.bimsync.com/v2/projects/"+ req.body.project_id,
      headers:{
        Authorization: oauth
      }
    };
    return new Promise (function(resolve, reject){
      request.get(options, function(err, response, body){
        if(!err){
          var project = JSON.parse(body);
          projectName = project.name;
          var updateDate = new Date(project.updatedAt);
          var date = updateDate.getDate() + '/' + (updateDate.getMonth() + 1) + '/' +  updateDate.getFullYear();
          resolve(date);
        }else {
          console.log(err);
          res.redirect("/")
        }
      })
    })
  }

//Récupère le nombre de révision par modèle dans le projet choisi
  function getModelsbyType(){
    var oauth = "Bearer " + req.user.access_token;
    var options = {
      url:"https://api.bimsync.com/v2/projects/"+ req.body.project_id +"/revisions",
      headers:{
        Authorization: oauth
      }
    };
    return new Promise (function(resolve, reject){
      request.get(options, function(err, response, body){
        if(!err){
          var revisions = JSON.parse(body);
          revisions.forEach(function(revision){
            var nvx = true;
            if(labelmodel.length !== 0){
              for (i = 0; i < labelmodel.length ; i++){
                if (revision.model.name === labelmodel[i]){
                  datamodel[i] += 1;
                  nvx = false;
                }
              }
            }
            if(nvx){
              datamodel.push(1),
              labelmodel.push(revision.model.name);
              var color = getRandomColor();
              backgroundColorsmodel.push(color);
              borderColorsmodel.push('#15191f');
            }
          })
          resolve();
        } else {
          console.log(err);
          res.redirect("/")
        }
      })
    })
  }


  // Fonction pour récupérer les listes de sujets dans le projet
    function getIssueBoards(){
      var oauth = "Bearer " + req.user.access_token;
      var issueBoardOptions = {
           url:"https://bcf.bimsync.com/bcf/beta/projects?bimsync_project_id="+ req.body.project_id,
           headers:{
             Authorization: oauth
           }
         };
        // Return new promise
        return new Promise(function(resolve, reject) {
          request.get(issueBoardOptions, function(err, resp, issueBoardBody) {
            if (err) {
              reject(err);
            } else {
              var issueBoards = JSON.parse(issueBoardBody);
              resolve(issueBoards);
            }
          });
        });
      }


  // Fonction pour récupérer les sujets d'une liste de sujet
    var fnGetTopics = function getTopics(j){
      var oauth = "Bearer " + req.user.access_token;
      var topicsOptions = {
           url:"https://bcf.bimsync.com/bcf/beta/projects/"+ j.project_id +"/topics",
           headers:{
             Authorization: oauth
           }
      };
        // Return new promise
      return new Promise(function(resolve, reject) {
        request.get(topicsOptions, function(err, resp, topicsBody) {
          if (err) {
            reject(err);
          } else {
            var topics = JSON.parse(topicsBody);
            topics.forEach(function(topic){
              topicsList.push(topic)
            })
            resolve();
          }
        });
      });
    }

   // Fonction qui joue la fonction du dessus sur toutes les listes de sujets du projet
    function getAllTopics (){
      return new Promise (function(resolve, reject){
        getIssueBoards().then(function(issueBoards){
          var getAllTopics = issueBoards.map(fnGetTopics);
          var resultArray = Promise.all(getAllTopics);
          resultArray.then(function(){
            resolve();
          })
        })
      })
    }

//Fonction principale jouant une par une
// les fonctions au dessus pour récupéré toute la donnée nécessaire pour générer la page
  function main(){

    //Déclare les variables pour les promises
    var getUsersPromise = getUsers();
    var getProjectsPromise = getProjects();
    var getModelsbyTypePromise = getModelsbyType();
    var getProjectLastUpdatePromise = getProjectLastUpdate();
    var getAllTopicsPromise = getAllTopics();

    getProjectsPromise.then(function(dataProjects){
      getModelsbyTypePromise.then(function(modelsByType){
        getUsersPromise.then(function(dataUsers){
          getAllTopicsPromise.then(function(){
            getProjectLastUpdatePromise.then(function(projectLastUpdate){
              res.render("requests/by_project", {
                projects:dataProjects,
                usersNb:dataUsers.length,
                usersList: dataUsers,
                projectLastUpdate:projectLastUpdate,
                datamodel:datamodel,
                labelmodel:labelmodel ,
                backgroundColorsmodel:backgroundColorsmodel ,
                borderColorsmodel:borderColorsmodel ,
                projectName: projectName,
                topics: topicsList
              });
            })
          })
        })
      })
    })
  }

//Génère une couleur aléatoire
  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
      colorSTR =  color;
    }
    return colorSTR;
  }

//Lance la fonction principale 
  main();
});

module.exports = router;
