const express    = require("express"),
      router     = express.Router(),
      middleware = require("../../middleware"),
      request    = require("request"),
      session    = require('cookie-session');

//===================SHOW THE PROJECTS OF THE USER
//When the project route is hit,
router.get("/", middleware.isLoggedIn, getProjects);

//get the users,
function getProjects (req, res){
  var oauth = "Bearer " + req.user.access_token;
  var options = {
    url:"https://api.bimsync.com/v2/projects",
    headers:{
      Authorization: oauth
    }
  };
  request.get(options, prepareData);
}

//then prepare the data to render the bargraph
function prepareData (err, response, body){
  if(!err){
      var result = JSON.parse(body);
      var datas = [];
      var labels = [];
      var backgroundColors = [];
      var borderColors = [];
//* Get the issue boards of each project
      var actions = result.map(fn); // run the function over all items

//When the data is completed,
      var resultArray = Promise.all(actions); // pass array of promises

//Go on and render
      resultArray.then render();
  } else {
    console.log(err);
  }
}

//* Get the issue boards of each project
var fn = function asyncGetIssueBoards(i){
    labels.push(i.name);
    backgroundColors.push("#364150");
    borderColors.push('#15191f');
    var issueBoardsOptions = {
       url:"https://bcf.bimsync.com/bcf/beta/projects?bimsync_project_id="+ i.id,
       headers:{
         Authorization: oauth
       }
    };
    request.get(issueBoardsOptions, getTopics
//** Get the topics of each issue boards
    var actions2 = result.map(fun2);
    var resultArray2 = Promise.all(actions2);
    resultArray2.then return new Promise(getTopics);
}

var fn2 = function asyncGetTopics(resolve, reject){
  if(err){
    reject (err);
  }else {
    var = 0;
    getTopics();
    resolve(x);
  }
}

function getTopics(){
      // Do async job
       function(err, resp, issueBoardsBody) {
        if (err) {
          reject(err);
        } else { returnPromisesTopics()
        }
      }
    }

    function returnPromisesTopics(){
      var x= 0;
      var models = JSON.parse(issueBoardsBody);
      for(j=0; j<=issueBoardsBody.length; j++){


  }

  var topicsOptions = {
    url:"https://bcf.bimsync.com/bcf/beta/projects/"+ j.project_id +"/topics",
    headers:{
      Authorization: oauth
    }
  };
  request.get(topicsOptions, function(err, resp, topicsBody) {
    if (err) {
      reject(err);
    } else {
      var topics = JSON.parse(topicsBody);
      x= x+topicsBody.length;
    }
  })
}
resolve(x);


function render(data){
  // we now have a promises array and we want to wait for it
  res.render("requests/projects", {
    result:result ,
    labels:labels ,
    datas:data ,
    backgroundColors:backgroundColors ,
    borderColors:borderColors
  })
}

module.exports = router;
