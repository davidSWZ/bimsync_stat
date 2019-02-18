const express    = require("express"),
      router     = express.Router(),
      middleware = require("../../middleware"),
      request    = require("request"),
      session    = require('cookie-session');

//===================SHOW THE PROJECTS OF THE USER
router.get("/", middleware.isLoggedIn, function (req, res){
  var oauth = "Bearer " + req.user.access_token;
  var options = {
    url:"https://api.bimsync.com/v2/projects",
    headers:{
      Authorization: oauth
    }
  };
  request.get(options, function(err, response, body){
    if(!err){
      var result = JSON.parse(body);
      var datas = [];
      var labels = [];
      var backgroundColors = [];
      var borderColors = [];

      var fn = function asyncGetRevisions(i){
        // Setting URL and headers for request
              labels.push(i.name);
              backgroundColors.push("#364150");
              borderColors.push('#15191f');
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
             				resolve(models.length);
             			}
             		});
             	});
      };

      // map over forEach since it returns
      var actions = result.map(fn); // run the function over all items
      // we now have a promises array and we want to wait for it
      var resultArray = Promise.all(actions); // pass array of promises

      resultArray.then(data =>{
            res.render("requests/projects", {
              result:result ,
              labels:labels ,
              datas:data ,
              backgroundColors:backgroundColors ,
              borderColors:borderColors
            })
        }
      );
    }
    else{
      console.log(err);
    }
  });
});

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
