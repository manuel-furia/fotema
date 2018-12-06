// THE PURPOSE OF THIS FILE IS TO 'CATCH' ALL POSSIBLE UI EVENTS (BUTTON CLICKS AND SO FORTH)
// THIS FILE SHOULD BE LINKED TO ALL FILES WHICH HAVE SOME DYNAMIC FUNCTION

// THE FILE  FUNCTIONS IN THE FOLLOWING WAY:
// 1. It receives an event.
// 2. It acts according to whatever that event needs to do (post, get is pretty normal route for refreshing pictures after upload)
'use strict';
import {getImages} from './api/get.js';
import {showImages} from './renderer/renderer.js';
import {uploadImages} from './api/post.js';
import {postUserData} from './api/post.js';


let start = 0;
const amount = 30;
//event listener function for fileupload
const mediaForm = document.querySelector('#mediaform');
const uploadEvent = (event) => {
  console.log('starting the event chain for upload');
  event.preventDefault();
//TODO:get the image data here, and pass it forward.
  uploadImages()
  //when you upload a photo, you post the form into /bla bla

};

//search for content
const search = () => {
  const searchText = document.querySelector(
      '#searchForm input[name="search"]').value;
  get.search(searchText, (json) => {

    renderer.showSearchResults(json);
  });
};

//function that runs on fresh page load
function onPageLoad(t, obj) {
  console.log(t, obj);
  start = 0;
  getImages(t, start, amount, (json) => {
    showImages(json);
  });
};

//function that runs when view more button is clicked
function viewMoreLoad(t, obj) {
  start += amount;
  console.log(t, start, amount);
  getImages(t, start, amount, (json) =>{
      showImages(json);
  });
};


const signIn = (event)=> {
  //first needs to check if given credentials are correct
  event.preventDefault();
  postUserData('signin', mediaForm);
};

const signUp = (event)=> {
  const signUpForm = document.querySelectorAll('.signup');
  event.preventDefault();
  //console.log(signUpForm);
  const test = Array.prototype.slice.call(signUpForm);
  let result = {};
  test.forEach(elem =>{
    Object.assign(result, {[elem.name]: elem.value});
  });
  postUserData('signup', result);
};


document.getElementById('signin').addEventListener('submit', signIn);

document.getElementById('signup').addEventListener('submit', signUp);


if (mediaForm != null) mediaForm.addEventListener('submit', uploadEvent);

const searchForm = document.getElementById('searchForm');
if (searchForm != null) searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  search();
});

document.getElementById('btnViewMore').addEventListener('click', ()=>{
  viewMoreLoad(page, document.getElementById('imageTarget'))
});

onPageLoad(page, document.getElementById('imageTarget'));