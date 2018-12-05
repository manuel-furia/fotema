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

export const postUserData = (x, mediaForm) =>{
  const formData = new FormData(mediaForm);
  console.log(formData);
  const settings = {
    method: 'post',
    body: formData,
  };
  if(x === 'signin') {
    fetch('/signin', settings);
  }else{
    fetch('/signup', settings);
  }

};

