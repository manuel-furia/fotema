'use strict';

const uploadImages = (callback) => {
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

module.exports={
  uploadImages:uploadImages,
};
