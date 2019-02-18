const express    = require("express"),
      router     = express.Router(),
      middleware = require("../../middleware"),
      request    = require("request"),
      bodyParser = require("body-parser"),
      session    = require('cookie-session');

//===================SHOW THE PROJECTS OF THE USER
router.get("/", middleware.isLoggedIn, function (req, res){
  var datas = [];
  var labels = [];
  var backgroundColors = [];
  var borderColors = [];

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

  function getIssueBoards(i){
    var issueBoardOptions = {
         url:"https://bcf.bimsync.com/bcf/beta/projects?bimsync_project_id="+ i.id,
         headers:{
           Authorization: oauth
         }
       };
      // Return new promise
      return new Promise(function(resolve, reject) {
        // Do async job
        labels.push(i.name);
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

  function getAllIssueBoards(){
    var getProjectsPromise = getProjects();
    getProjectsPromise.then(function(projects){
      return new Promise(function(resolve, reject){
        var getAllIssues = projects.map(getIssueBoards());
        var resultArray = Promise.all(getAllIssues);
        resolve(resultArray);
      })
    })
  }

  function main(){
    var getAllIssueBoardsPromise = getAllIssueBoards();
    getAllIssueBoardsPromise.then(function(result){
      res.send(result);
    })
  }

  main();
});

  //         var fn2 = function asyncGetTopics(j){
  //
  //             var topicsOptions = {
  //               url:"https://bcf.bimsync.com/bcf/beta/projects/"+ j.project_id +"/topics",
  //               headers:{
  //                 Authorization: oauth
  //               }
  //             };
  //             return new Promise(function(resolve, reject){
  //               request.get(topicsOptions, function(err, resp, topicsBody) {
  //                 if (err) {
  //                   reject(err);
  //                 } else {
  //                   var topics = JSON.parse(topicsBody);
  //                   resolve(topics);
  //                 }
  //               })
  //             });
  //           }
  //
  //           var actions2 = results.map(fn2);
  //           var resultActions2 = Promise.all(actions2);
  //           resultActions2.then(function(result2){
  //             console.log(result2);
  //           })
  //         })
  //     } else{
  //       console.log(err);
  //     }
  //   });
  // });
      // resultArray.then(data =>{
      //       res.render("requests/projects", {
      //         result:result ,
      //         labels:labels ,
      //         datas:data ,
      //         backgroundColors:backgroundColors ,
      //         borderColors:borderColors
      //       })
      //   }
      // );

//==============================================================================
router.get("/by_project", middleware.isLoggedIn, function(req, res){
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
      res.render("requests/by_project", {projects:projects, usersNb:null});
    } else {
      console.log(err);
      res.redirect("/")
    }
  })
});

router.post("/by_project", middleware.isLoggedIn, function(req, res){
  // console.log(req.body.project_id);
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
              resolve(users.length);
          } else {
            console.log(err);
            res.redirect("/")
          }
        })
      })
  }

  function main(){
    var getUsersPromise = getUsers();
    var getProjectsPromise = getProjects();
    getProjectsPromise.then(function(dataProjects){
      getUsersPromise.then(function(dataUsers){
        res.render("requests/by_project", {projects:dataProjects, usersNb:dataUsers});
      })
    })
  }

  main();
});

module.exports = router;
