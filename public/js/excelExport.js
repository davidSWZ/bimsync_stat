var fileTitle = 'BIMSYNC_Members'; // or 'my-unique-title'


var headers = {
  users: 'Members'
};


function exportUsers(objArray, headers, fileTitle) {

  var csv = '';

  for (var i = 0; i < objArray.length; i++) {
      var line = objArray[i].user.name;
      csv += line + '\r\n';
  }

  var exportedFilename = fileTitle + '.csv' || 'export.csv';

  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, exportedFilename);
  } else {
      var link = document.createElement("a");
      if (link.download !== undefined) { // feature detection
          // Browsers that support HTML5 download attribute
          var url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", exportedFilename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
  }
}
