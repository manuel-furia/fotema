// THE PURPOSE OF THIS FILE IS TO 'CATCH' ALL POSSIBLE UI EVENTS (BUTTON CLICKS AND SO FORTH)
// THIS FILE SHOULD BE LINKED TO ALL FILES WHICH HAVE SOME DYNAMIC FUNCTION

// THE FILE  FUNCTIONS IN THE FOLLOWING WAY:
// 1. It receives an event.
// 2. It acts according to whatever that event needs to do 
'use strict';


let start = 0;
const amount = 12;

const textParser = (string) => {
 //we need to find #tags and everything else.
  let temp = string.split(' ');
  console.log(temp);
  const tags = [];
  const otherTerms = [];
  for(let i = 0; i < temp.length; i++){
    if(temp[i].charAt(0) === '#'){tags.push(temp[i])}
    else{otherTerms.push(temp[i])}
  }


};

const uploadEvent = (event) => {
  console.log('starting the event chain for upload');
  event.preventDefault();
//TODO:get the image data here, and pass it forward.
  uploadImages().then((json) => {
    if (json.err) {
        alert(json.err);
    } else {
        hideUploadForm();
        location.reload();
    }
  }).catch(err => alert(err));
  //when you upload a photo, you post the form into /bla bla

};

const likeMedia = (id) => {
    const likeBtn = document.getElementById('like' + id);
    const likesSpan = document.getElementById('nlikes' + id);
    
    getUserId().then(userId => {
        if (likeBtn) {
            const liked = likeBtn.classList.contains('likedlikesnumber');
            const likes = parseInt(likesSpan.textContent, 10);
            
            if (liked) {
                likeBtn.classList.remove('likedlikesnumber');
               likesSpan.textContent = likes - 1;
                postUnlikeMedia(id, userId);
            } else {
                likeBtn.classList.add('likedlikesnumber');
                likesSpan.textContent = likes + 1;
                postLikeMedia(id, userId);
            }

        }

    }).catch(err => alert(err));
};

//search for content
const searchFunction = () => {

  //find the searchtext
  const term = document.getElementById('searchBar').value;
  console.log(term);
  //now we have the search text, time to parse it
  term.trim();
  textParser(term);
};

//function that runs on fresh page load
function onPageLoad(t, obj) {
  console.log(t, obj);
  updateHeader();
  start = 0;
  getImages(start, amount).then((json) => {
    showImages(json);
  });


};

//function that runs when view more button is clicked
function viewMoreLoad(t, obj) {
  start += amount;
  console.log(t, start, amount);
  getImages(start, amount).then((json) =>{
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

const validationCheck =(data) => {
  console.log(data);
  return (data.password === data.repeatPassword);
};

const signUp = (event) => {
  const signUpForm = document.getElementById('signup');
  const data = getFieldsFromForm(signUpForm);
  event.preventDefault();
  if(!validationCheck(data)){
    alert('Given passwords don\'t match'); return;
  }
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

document.getElementById('signin').addEventListener('submit', signIn);

document.getElementById('signup').addEventListener('submit', signUp);

document.querySelector('.signout').addEventListener('click', signOut);

//event listener function for fileupload
const mediaForm = document.querySelector('#mediaform');
if (mediaForm != null) mediaForm.addEventListener('submit', uploadEvent);

const searchForm = document.getElementById('searchForm');
if (searchForm != null) searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  searchFunction();
});


document.getElementById('btnViewMore').addEventListener('click', ()=>{
  viewMoreLoad(page, document.getElementById('imageTarget'))
});

onPageLoad(page, document.getElementById('imageTarget'));
