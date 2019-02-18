const express    = require("express"),
      router     = express.Router(),
      middleware = require("../../middleware"),
      request    = require("request"),
      session    = require('cookie-session');

//===================SHOW THE PROJECTS OF THE USER

router.get("/", middleware.isLoggedIn, function (req, res){
  var oauth = "Bearer " + req.user.access_token;
  var options = {
    url:"https://bcf.bimsync.com/bcf/beta/projects/11c7a9c7-79c6-4f24-89b4-7e59dc65487d/topics",
    headers:{
      Authorization: oauth
    }
  };
  request.get(options, function(err, response, body){
    if(!err){
      res.send(body);
    } else {
      console.log(err);
    }
  })
});
    // if(!err){
    //   var result = JSON.parse(body);
    //   var datasTopics = [];
    //   var labelsTopics = [];
    //   var backgroundColorsTopics = [];
    //   var borderColorsTopics = [];
    //
    //   var fn = function asyncGetRevisions(i){
    //     // Setting URL and headers for request
    //           labelsTopics.push(i.name);
    //           backgroundColorsTopics.push("#4db3af");
    //           borderColorsTopics.push('#15191f');
    //            var topicsOptions = {
    //              url:"https://bcf.bimsync.com/bcf/beta/projects/548b3b47e51c4df78da3e17d8c7a4a85/topics",
    //              headers:{
    //                Authorization: oauth
    //              }
    //            };
             	// Return new promise
             	// return new Promise(function(resolve, reject) {
             	// 	// Do async job
             	// 	request.get(topicsOptions, function(err, resp, topicsBody) {
             	// 		if (err) {
             	// 			reject(err);
             	// 		} else {
              //       var topics = JSON.parse(topicsBody);
             	// 			resolve(topics.length);
             	// 		}
             	// 	});
             	// });
      // };

      // // map over forEach since it returns
      // var actions = result.map(fn); // run the function over all items
      // // we now have a promises array and we want to wait for it
      // var resultArray = Promise.all(actions); // pass array of promises
      //
      // resultArray.then(data =>{
      //       prepareRevisionBarGraph();
      //   }
      // );
//     }
//     else{
//       console.log(err);
//     }
//   });
// });
//
// function prepareRevisionBarGraph(){
//     router.get("/", function (req, res){
//       var oauth = "Bearer " + req.user.access_token;
//       var options = {
//         url:"https://api.bimsync.com/v2/projects",
//         headers:{
//           Authorization: oauth
//         }
//       };
//       request.get(options, function(err, response, body){
//         if(!err){
//           var result = JSON.parse(body);
//           var datas = [];
//           var labels = [];
//           var backgroundColors = [];
//           var borderColors = [];
//
//           var fn = function asyncGetRevisions(i){
//             // Setting URL and headers for request
//                   labels.push(i.name);
//                   backgroundColors.push("#364150");
//                   borderColors.push('#15191f');
//                    var modelOptions = {
//                      url:"https://api.bimsync.com/v2/projects/"+ i.id +"/revisions",
//                      headers:{
//                        Authorization: oauth
//                      }
//                    };
//                  	// Return new promise
//                  	return new Promise(function(resolve, reject) {
//                  		// Do async job
//                  		request.get(modelOptions, function(err, resp, modelBody) {
//                  			if (err) {
//                  				reject(err);
//                  			} else {
//                         var models = JSON.parse(modelBody);
//                  				resolve(models.length);
//                  			}
//                  		});
//                  	});
//           };
//
//           // map over forEach since it returns
//           var actions = result.map(fn); // run the function over all items
//           // we now have a promises array and we want to wait for it
//           var resultArray = Promise.all(actions); // pass array of promises
//
//           resultArray.then(data =>{
//                 res.render("requests/projects", {
//                   result:result ,
//                   labels:labels ,
//                   datas:data ,
//                   labelsTopics:labelsTopics ,
//                   datasTopics:dataTopics ,
//                   backgroundColors:backgroundColors ,
//                   borderColors:borderColors,
//                   backgroundColorsTopics:backgroundColorsTopics ,
//                   borderColorsTopics:borderColorsTopics
//                 })
//             }
//           );
//         }
//         else{
//           console.log(err);
//         }
//       });
//     });
// }

module.exports = router;
