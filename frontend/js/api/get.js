'use strict';



const getImages = (json) =>{
  console.log('getting images???');
  fetch('/images').then(response=>{
    return response.json();
  }).then(json =>{
    console.log(json);
    //has the images, now calls for the renderer to render them
    showImages(json);
  });
  console.log('getting images OK???');
};

module.exports ={
  getImages:getImages(),
};