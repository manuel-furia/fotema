// THE PURPOSE OF THIS FILE IS TO 'CATCH' ALL POSSIBLE UI EVENTS (BUTTON CLICKS AND SO FORTH)
// THIS FILE SHOULD BE LINKED TO ALL FILES WHICH HAVE SOME DYNAMIC FUNCTION

// THE FILE  FUNCTIONS IN THE FOLLOWING WAY:
// 1. It receives an event.
// 2. It acts according to whatever that event needs to do (post, get is pretty normal route for refreshing pictures after upload)
'use strict';
const post = require('./api/post');
const get = require('./api/get');
const renderer = require('./renderer/renderer');



//event listener for fileupload
const mediaForm = document.querySelector('#mediaform');
const uploadEvent = (event) => {
  console.log('starting the event chain for upload');
  event.preventDefault();
  //call relevant method in post
  post.uploadImages((json)=>{
    get.getImages((json) =>{
      renderer.showImages(json);
      //TODO: add check for status ok or failure.
    });
  })
};

mediaForm.addEventListener('submit', uploadEvent);