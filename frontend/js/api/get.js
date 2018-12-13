/*
Contains generic API calls that issue a GET request
*/

'use strict';

//Get the images for the main wall
const getImages = (start, amount) =>{
  return fetch(apiroot +'get/wall/' + start + '/' + amount).then(response=>response.json()).then(json => {
    return json;
  });
};


//Get the login state for the visitor (anonimous or logged in, login id and type)
const getLoginState = () => {
  const settings = {
    method: 'GET'
  };
  return fetch(apiroot + `get/loginstate`, settings).then((response) => {
    return response.json();
  })
};

