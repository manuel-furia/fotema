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
    fetch('/node/signup', settings).then((res) => {
      console.log('testi whattehel');
      if(res.ok){
        console.log('creation successful!')
      }else{
        let message = res.headers.get('Message');
        alert(message);
      }}).catch(err =>console.log(err));
  }else{
    fetch('/node/signin', settings);
  }

};

