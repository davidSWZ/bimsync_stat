var loader = document.getElementsByClassName("sous-menu");

for(i = 0; i<loader.length; i++){
  loader[i].addEventListener("click", load);
}


function load(){
  var spinner = document.getElementsByClassName("chargement");
  spinner[0].style.display="block";
}

window.onload= unload;

function unload(){
  var spinner = document.getElementsByClassName("chargement");
  spinner[0].style.display="none";
}
