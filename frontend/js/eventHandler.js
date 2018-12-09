// THE PURPOSE OF THIS FILE IS TO 'CATCH' ALL POSSIBLE UI EVENTS (BUTTON CLICKS AND SO FORTH)
// THIS FILE SHOULD BE LINKED TO ALL FILES WHICH HAVE SOME DYNAMIC FUNCTION

// THE FILE  FUNCTIONS IN THE FOLLOWING WAY:
// 1. It receives an event.
// 2. It acts according to whatever that event needs to do (post, get is pretty normal route for refreshing pictures after upload)
'use strict';


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
const onSearch = () => {
  const searchText = document.querySelector(
      '#searchForm input[name="search"]').value;
  get.search(searchText, (json) => {

    renderer.showSearchResults(json);
  });
};

//function that runs on fresh page load
function onPageLoad(t, obj) {
  console.log(t, obj);

  updateHeader();

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
  event.preventDefault();
  const signInForm = document.getElementById('signin');
  const data = getFieldsFromForm(signInForm);
  postSignIn(data).then((json) => {
    if (json.user && !json.err){ 
      location.reload();
    } else {
      alert(json.err);
    }
  });
};

const signUp = (event) => {
  const signUpForm = document.getElementById('signup');
  const data = getFieldsFromForm(signUpForm);
  event.preventDefault();
  postSignUp(data).then((json) => {
    console.log(json);
    if(json.err){
      alert(json.err);
    }else{
      location.reload();
    }
  });
};

const signOut = (event) => {
  postSignOut().then(() => {
    window.location.href = apiroot;
    location.reload();
  });
};

const images = document.querySelectorAll('.clickedMedia');
console.log(images);

document.getElementById('signin').addEventListener('submit', signIn);

document.getElementById('signup').addEventListener('submit', signUp);

document.querySelector('.signout').addEventListener('click', signOut);


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
