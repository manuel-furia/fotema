'use strict';

export const uploadImages = (callback) => {
  const formData = new FormData(mediaForm);
  const settings = {
    method: 'post',
    body: formData,
  };

  fetch('/upload', settings).then((response) =>{

    return response.json();

  }).then((json) =>{
    console.log(json);
    callback(json);
  });
  console.log('uploading OK');
};

export const postUserData = (x, userData) =>{
  const settings= {
    method: 'POST',
    body: JSON.stringify(userData),
    headers: {
      'Content-Type': 'application/json'
    },
  };

  if(x === 'signup') {
    fetch('/node/signup', settings).then((res) => { console.log(res); return res.json()}).then(json => {
      console.log(json);
      if(json.err){
        alert(json.err);
      }else{
        console.log('success!');
        window.location.href = '/node/userwall/' + json.user+ '/0/12';
      }}).catch(err =>console.log(err));
  }else{
    fetch('/node/signin', settings);
  }

};

