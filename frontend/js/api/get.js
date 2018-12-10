'use strict';

//for getting images
// t is for the page type, because it needs to fetch different images depending on the occasion
//TODO:this needs to be fully implemented for user walls and personal walls
const getImages = (start, amount) =>{
  return fetch(apiroot +'get/wall/' + start + '/' + amount).then(response=>response.json()).then(json => {
    return json;
  });
};

//for searching content
const search = (term) =>{
  const settings = {
    method: 'GET'
  };
  return fetch(apiroot + `get/search/:${term}`, settings).then((response) => {
    return response.json();
  })
};

const getLoginState = () => {
  const settings = {
    method: 'GET'
  };
  return fetch(apiroot + `get/loginstate`, settings).then((response) => {
    return response.json();
  })
};

