// THE PURPOSE OF THIS FILE IS TO 'CATCH' ALL POSSIBLE UI EVENTS (BUTTON CLICKS AND SO FORTH)
// THIS FILE SHOULD BE LINKED TO ALL FILES WHICH HAVE SOME DYNAMIC FUNCTION

// THE FILE  FUNCTIONS IN THE FOLLOWING WAY:
// 1. It receives an event.
// 2. It acts according to whatever that event needs to do

'use strict';

// these variables refer to the amount of images to be loaded into the frontpage. amount = how many more images.
let start = 0;
const amount = 12;

// this function is used in search function, when the search terms need to be parsed. It takes the whole search entry and parses it
// into tags, usernames and otherTerms.
const textParser = (string) => {
 //we need to find #tags and everything else.
  let temp = string.split(' ');
  const tags = [];
  const usernames = [];
  const otherTerms = [];
  for(let i = 0; i < temp.length; i++){
    if(temp[i].charAt(0) === '#'){tags.push(temp[i].replace("#",''))}
    else if(temp[i].charAt(0) === '@'){usernames.push(temp[i].replace("@", ""))}
    else{otherTerms.push(temp[i])}
  }
  return [tags , usernames, otherTerms];
};

// function used for uploading single images.
const uploadEvent = (event) => {
  event.preventDefault();
  uploadImages().then((json) => {
    if (json.err) {
        alert(json.err);
    } else {
        hideUploadForm();
        location.reload();
    }
  }).catch(err => alert(err));
};

// function used in liking media. parameter id is the id of the particular piece of media that was interacted with.
const likeMedia = (id) => {
    likeElem(id, 'like', 'nlikes', 'likedlikesnumber', postLikeMedia, postUnlikeMedia);
};

const likeComment = (id) => {
    likeElem(id, 'clike', 'nclikes', 'likedcommentsnumber', postLikeComment, postUnlikeComment);
};


const likeElem = (id, btn, span, cssClass, likeAction, unlikeAction) => {
    const likeBtn = document.getElementById(btn + id);
    const likesSpan = document.getElementById(span + id);
    
    getUserId().then(userId => {
        if (likeBtn) {
            const liked = likeBtn.classList.contains(cssClass);
            const likes = parseInt(likesSpan.textContent, 10);
            
            if (liked) {
                likeBtn.classList.remove(cssClass);
                likesSpan.textContent = likes - 1;
                unlikeAction(id, userId);
            } else {
                likeBtn.classList.add(cssClass);
                likesSpan.textContent = likes + 1;
                likeAction(id, userId);
            }

        }

    }).catch(err => alert(err));
};

// function used for searching content
const searchFunction = () => {
  //find the searchtext
  const term = document.getElementById('searchBar').value;
  console.log(term);
   // parse the text, first remove the whitespace. then send the remaining string into textparser.
  term.trim();
  postSearchTerms(textParser(term)).then((json)  => {
    // json contains the images returned by the search terms
    showImages(json, 'searchResults');
  });

};

// function that runs on fresh page load
function onPageLoad(t, obj) {
  updateHeader();
  start = 0;
  getImages(start, amount).then((json) => {
    showImages(json);
  });
}

// function that runs when view more button is clicked
function viewMoreLoad(t, obj) {
  start += amount;
  console.log(t, start, amount);
  getImages(start, amount).then((json) =>{
      showImages(json);
  });
}

// function used when user signs in
const signIn = (event)=> {
  event.preventDefault();
  const signInForm = document.getElementById('signin');
  const data = getFieldsFromForm(signInForm);
  // function postSignIn literally posts the signin data. located in /api
  postSignIn(data).then((json) => {
    if (json.user && !json.err){ 
      location.reload();
    } else {
      alert(json.err);
    }
  });
};

// function used when creating a user.
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

// a simple function to close the search result pop-up
const closeSearchResults = () =>{
  document.getElementById('searchResultsContainer').style.display = 'none';
};

// a simple signup validation check
const validationCheck =(data) => {
  console.log(data);
  return (data.password === data.repeatPassword);
};

// function used when signin out.
const signOut = (event) => {
  postSignOut().then(() => {
    window.location.href = apiroot;
    location.reload();
  });
};


// different event listeners being set up.
document.getElementById('signin').addEventListener('submit', signIn);
document.getElementById('signup').addEventListener('submit', signUp);
document.querySelector('.signout').addEventListener('click', signOut);
document.getElementById('btnCloseSearchResult').addEventListener('click', closeSearchResults);

const images = document.querySelectorAll('.clickedMedia');
console.log(images);

try {
    document.getElementById('signin').addEventListener('submit', signIn);
    document.getElementById('signup').addEventListener('submit', signUp);
    document.querySelector('.signout').addEventListener('click', signOut);
    document.getElementById('btnViewMore').addEventListener('click', ()=>{
        viewMoreLoad(page, document.getElementById('imageTarget'))
    });
    document.getElementById('btnCloseSearchResult').addEventListener('click', closeSearchResults);
} catch(ex) {}





// event listener function for fileupload
const mediaForm = document.querySelector('#mediaform');
if (mediaForm != null) mediaForm.addEventListener('submit', uploadEvent);

// event listener and function call for search function
const searchForm = document.getElementById('searchForm');
if (searchForm != null) searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  searchFunction();
});


// eventlistener being set up for view more button
document.getElementById('btnViewMore').addEventListener('click', ()=>{
  viewMoreLoad(page, document.getElementById('imageTarget'))
});

onPageLoad(page, document.getElementById('imageTarget'));
