'use strict'

function onPageLoad (){
  const imageID = document.getElementById('userID').value;
  //now fetch the image

  fetch('/node/get/singleMedia/' + imageID).then(response => response.json()).then(json => {
   console.log(json);
  });
}

onPageLoad();