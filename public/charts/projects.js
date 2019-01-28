//   var dataProjects = {
//         Labels: [],
//         data: [],
//         backgroundColor: [],
//         borderColor: [],
//       };
//
//    result.forEach(function getProjectData(project){
//      dataProjects.labels.push(project["name"]);
//      dataProjects.data.push("10");
//      dataProjects.backgroundColor.push('rgba(255, 99, 132, 0.2)');
//      dataProjects.borderColor.push('rgba(255,99,132,1)');
//    });
//
// console.log(dataProjects);
//
// var ctx = document.getElementById("myChart").getContext('2d');
// var myChart = new Chart(ctx, {
//     type: 'horizontalBar',
//     data: {
//         labels: dataProjects.labels,
//         datasets: [{
//             label: 'models by projects',
//             data: dataProjects.data,
//             backgroundColor: dataProjects.backgroundColor,
//             borderColor: dataProjects.borderColor,
//             borderWidth: 1
//         }]
//     },
//     options: {
//         scales: {
//             yAxes: [{
//                 ticks: {
//                     beginAtZero:true
//                 }
//             }]
//         }
//     }
// });
