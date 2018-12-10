'use strict';

const uploadImages = (callback) => {
  const formData = new FormData(mediaForm);
  const settings = {
    method: 'post',
    body: formData,
  };

  return fetch(apiroot + 'post/upload', settings).then((response) =>{
    return response.json();
  }).catch(err => {return {err: 'Server internal error.'}});
};

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

