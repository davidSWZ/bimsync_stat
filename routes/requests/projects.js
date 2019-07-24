const express    = require("express"),
      router     = express.Router(),
      middleware = require("../../middleware"),
      request    = require("request"),
      bodyParser = require("body-parser"),
      session    = require('cookie-session');

// Afficher la page Global View donnant la liste de tout les projets
// avec le nombre de révisions pour chaque et le nombre de sujet pour chaque

router.get("/", middleware.isLoggedIn, function (req, res){

  // Déclare les variables qui seront nécéssaires pour les scripts chart.js sur le front
  var datasProjects = [];
  var datasTopics = [];
  var labelsProjects = [];
  var labelsTopics = [];
  var backgroundColors = [];
  var borderColors = [];
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

  //Prend l'ID d'un projet et récupère la liste des révisions du projet
  // et enregistre le nombre de révision dans le paramêtre datasProjects
  var fn4 = function asyncGetRevisions(i){
    // Setting URL and headers for request
    var modelOptions = {
      url:"https://api.bimsync.com/v2/projects/"+ i.id +"/revisions",
      headers:{
       Authorization: oauth
      }
    };
   	// Return new promise
   	return new Promise(function(resolve, reject) {
   		// Do async job
   		request.get(modelOptions, function(err, resp, modelBody) {
   			if (err) {
   				reject(err);
   			} else {
          var models = JSON.parse(modelBody);
          datasProjects.push(models.length);
          labelsProjects.push(i.name);
   				resolve();
   			}
   		});
   	});
  };

  // Une fois que la requête récupérant la liste des projets est finie, on joue
  // la fonction fn4 du dessus sur tous les projets pour récupérer le nombre de modèle pour chaque projet
  function GetmodelsByProject(){
    return new Promise(function(resolve, reject){
      var getProjectsPromise = getProjects();
      getProjectsPromise.then(function(projects){
        var getAllModels = projects.map(fn4);
        var resultArray = Promise.all(getAllModels);
        resultArray.then(function(result){
          resolve(result);
        })
      })
    })
  }

  // Fonction pour récupérer les listes de sujets dans un projet
  var fn = function getIssueBoards(i){
    var issueBoardOptions = {
         url:"https://bcf.bimsync.com/bcf/beta/projects?bimsync_project_id="+ i.id,
         headers:{
           Authorization: oauth
         }
       };
      // Return new promise
      return new Promise(function(resolve, reject) {
        // Do async job
        labelsTopics.push(i.name);
        backgroundColors.push("#364150");
        borderColors.push('#15191f');
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

  // Une fois la liste des projets est récupéré on joue
  // la fonction fn au dessus sur tous les projets
  function GetAllIssueBoards(){
    return new Promise(function(resolve, reject){
      var getProjectsPromise = getProjects();
      getProjectsPromise.then(function(projects){
        var getAllIssues = projects.map(fn);
        var resultArray = Promise.all(getAllIssues);
        resultArray.then(function(result){
          resolve(result);
        })
      })
    })
  }

// Fonction pour récupérer les sujets d'une liste de sujet
  var fn3 = function getTopics(j){
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
          resolve(topics.length);
        }
      });
    });
  }

// Fonction qui joue la fonction du dessus sur toutes les listes de sujets du projet
  var fn2 = function getTopicsOfOneProject (i){
    return new Promise (function(resolve, reject){
      var getAllTopicsFromOneProjects = i.map(fn3);
      var resultArray = Promise.all(getAllTopicsFromOneProjects);
      resultArray.then(function(result){
        resolve(result);
      })
    })
  }


//Fonction qui regroupe les fonctions lié au sujet du dessus
//et qui contabilise les sujets par projet
  function getAllTopics(){
    return new Promise(function(resolve, reject){
      var getIssueBoardsPromise = GetAllIssueBoards();
      getIssueBoardsPromise.then(function(issueBoards){
        var getAllTopicsFromAllProjects = issueBoards.map(fn2);
        var resultArray = Promise.all(getAllTopicsFromAllProjects);
        resultArray.then(function(result){
          result.forEach(function(i){
            var sum = i.reduce((a,b)=> a+b,0);
            datasTopics.push(sum);
          });
          resolve();
        })
      })
    })
  }


//Fonction principale qui lance la récupération des modèles
//et des sujets pour chaque projet de l'utilisateur
//Une fois la donnée récupéré on render la page html en passant au front les données nécessaire
// pour les graph chart.js
  function main(){
    var getBackProjects = getProjects();
    var getBackModelsByProject = GetmodelsByProject();
    var getBackAllTopics = getAllTopics();
      getBackModelsByProject.then(function(){
        getBackAllTopics.then(function(){
          res.render("requests/projects", {
            labelsProjects:labelsProjects ,
            labelsTopics:labelsTopics ,
            datasProjects:datasProjects ,
            datasTopics:datasTopics ,
            backgroundColors:backgroundColors ,
            borderColors:borderColors
          })
        })
      })
  }

// Lancement de la fonction principale
main();
});

module.exports = router;
