'use strict';

const uploadImages = (callback) => {
  const formData = new FormData(mediaForm);
  const settings = {
    method: 'post',
    body: formData,
  };

  return fetch('/upload', settings).then((response) =>{

    return response.json();

  }).then((json) =>{
    console.log(json);
    callback(json);
  });
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

