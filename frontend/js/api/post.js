/*
Contains generic API calls that issue a POST request
*/

'use strict';

//Upload an image to the server
const uploadImages = () => {
  const formData = new FormData(mediaForm);
  const settings = {
    method: 'post',
    body: formData,
  };

  return fetch(apiroot + 'post/upload', settings).then((response) =>{
    return response.json();
  }).catch(err => {return {err: 'Server internal error.'}});
};

//Check if a login response was successful or contained an error
const processLoginResponse = (resPromise) => {
    return resPromise.then(res => {
        if (res.status === 401){
            return {err: 'Wrong username or password.'};
        }
        else if (res.status === 200){
            return res.json();
        } else {
            return {err: 'Server internal error.'};
        }
    });
};

//Issue a sign in request
const postSignIn = (userData) =>{
  const settings= {
    method: 'POST',
    body: JSON.stringify(userData),
    headers: {
      'Content-Type': 'application/json'
    },
  };

  return processLoginResponse(fetch(apiroot + 'post/signin', settings));
};

//Register a new user
const postSignUp = (userData) =>{
  const settings= {
    method: 'POST',
    body: JSON.stringify(userData),
    headers: {
      'Content-Type': 'application/json'
    },
  };
  return processLoginResponse(fetch(apiroot + 'post/signup', settings));
};

//Sign out a currently logged in user
const postSignOut = () =>{
  const settings= {
    method: 'POST',
    body: '{}',
    headers: {
      'Content-Type': 'application/json'
    },
  };
  return fetch(apiroot + 'post/signout', settings);
};

//Add a like to a media from a user
const postLikeMedia = (mediaId, userId) => {
  const settings= {
    method: 'POST',
    body: JSON.stringify({mediaId: mediaId, userId: userId}),
    headers: {
      'Content-Type': 'application/json'
    },
  };
  return fetch(apiroot + 'post/like', settings);
}

//Remove a like from a media issued by a user
const postUnlikeMedia = (mediaId, userId) => {
  const settings= {
    method: 'POST',
    body: JSON.stringify({mediaId: mediaId, userId: userId}),
    headers: {
      'Content-Type': 'application/json'
    },
  };
  return fetch(apiroot + 'post/unlike', settings);
}

//Add a like to a comment from a user
const postLikeComment = (commentId, userId) => {
  const settings= {
    method: 'POST',
    body: JSON.stringify({commentId: commentId, userId: userId}),
    headers: {
      'Content-Type': 'application/json'
    },
  };
  return fetch(apiroot + 'post/likecomment', settings);
}

//Remove a like from a comment issued by a user
const postUnlikeComment = (commentId, userId) => {
  const settings= {
    method: 'POST',
    body: JSON.stringify({commentId: commentId, userId: userId}),
    headers: {
      'Content-Type': 'application/json'
    },
  };
  return fetch(apiroot + 'post/unlikecomment', settings);
}

//Issue a search request
const postSearchTerms = (terms) =>{
  const settings = {
    method: 'POST',
    body: JSON.stringify({tags: terms[0], usernames: terms[1] , otherTerms: terms[2]}),
    headers: {
      'Content-Type': 'application/json'
    },
  };
  return fetch(apiroot + 'post/search', settings);
};
