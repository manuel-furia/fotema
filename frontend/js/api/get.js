'use strict';


//for getting images
// t is for the page type, because it needs to fetch different images depending on the ocasion
//TODO:this needs to be fully implemented for user walls and personal walls
export const getImages = (t, start, amount, callback) =>{
  console.log('getting images???');
  if(t === 'anonwall')fetch('/node/' + t + '/' + start + '/' + amount).then(response=>{return response.json();}).then(json => {
    callback(json);
  });
  else if(t === 'userwall')fetch('/' + t + ' ' ).then(response => {return response.json();});
  else fetch('/' + t + ' ' ).then(response =>{return response.json();});
};

//for searching content
const search = (term) =>{
  const settings = {
    method: 'GET'
  };
  fetch(`/search/:${term}`, settings).then((response) => {
    return response.json();
  })
};
