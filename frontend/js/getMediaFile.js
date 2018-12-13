//Handle the events of the clickedMedia page (the page showing when the user clicks a specific media)

'use strict';

//Executed when the media page loads
function onMediaPageLoad (){
  //Fetch the image, the comments and decide if showing or not the delete button, depending on the user
  getImage().then(() => getComments()).then(() => deleteButton());
}

//Decide if the delete button should be shown or not
const deleteButton = () => {
  const deleteButton = document.getElementById('btnDeleteMedia');
  deleteButton.style.display ='none';
  //Figure out if the user is logged in, and which user it is
  getLoginState().then(res => {
    const data= {
      'id' : res.userid,
      'type' : res.type,
      'posterID': document.getElementById('posterID').value,
    };
    return data;
  }).then((data) => { 
    const deleteButton = document.getElementById('btnDeleteMedia');
    //Show the delete button only if the logged user is the same as the image owner or if the logged user is admin
    if(data.id === parseInt(data.posterID, 10) || data.type == 'admin'){
      deleteButton.style.display = '';
    }else{
      deleteButton.style.display ='none';
    }

  }).catch((err) => console.log(err))};

//Get the image data that will be displayed from the server
const getImage =() =>{
  //Get from the hidden input the id of the image we need to display
  //NOTE: the id has been injected from the backend by replacing the "%$m$%" string
  const imageID = document.getElementById('mediaID').value;
  const settings = {
    method: 'GET'
  };
  return fetch(apiroot + 'get/media/' + imageID, settings).then(response => response.json()).then(json => {
    buildImage(json);
  });
};

//Fetch a boolean telling if the media has been liked by the currently logged in user
const getMediaLiked =() =>{
  const imageID = document.getElementById('mediaID').value;
  const settings = {
    method: 'GET'
  };
  return fetch(apiroot + 'get/medialiked/' + imageID, settings).then(response => response.json());
};

//Get all the comments of this media
const getComments = () =>{
  const imageID = document.getElementById('mediaID').value;
  const settings = {
    method: 'GET'
  };
  return fetch(apiroot + 'get/comments/' + imageID, settings).then(response => response.json()).then(json => {
    buildComments(json);
  });
};

//Build the html of the image to be shown
const buildImage = (json) =>{
  const div = document.getElementById('mediaTarget');
  //check if the imahe has been liked (to decide the state of the "like" button)
  getMediaLiked().then(likeinfo => {
    const liked = likeinfo.liked ? 'likedlikesnumber' : '';
    div.innerHTML +=
    `
        <div class="gallery">
            <h4 class="media-title"> ${json.title}</h4>
            <input type='hidden' id='posterID' value='${json.user}'>
            <h5> by :  <a href="javascript:;" class="media-owner"><strong> ${json.ownername}</strong></a></h5>

                <img src="${apiroot}${json.path}" width="" height="" alt="">

        </div>

        <div class="desc">
            <p class="description">${json.description}</p>
            <p class="likesnumber ${liked}" id="like${json.id}"><button id="btnLike" onclick="likeMedia(${json.id})"><i class="fa fa-heart"></i></button><span class="nlikes" id="nlikes${json.id}">${json.likes}</span></p>
            <p class="commentsnumber"><button id="btnComment"><i class="fa fa-commenting"></i></button> ${json.comments}</p>
        </div>
  `
    });
};

//Build the html of the comments to be shown
const buildComments = (json) =>{
  const div = document.getElementById('commentBlock');
  div.innerHTML = '';
  //Build each comment individually
  for(let comment in json){
    //Fetch the time of the comment
    let time = new Date(json[comment].time);
    //Check if the comment has been liked, to decide the state of the "like" button
    const liked = json[comment].alreadyLiked ? 'likedcommentsnumber' : '';

  div.innerHTML += `
      
  <div class="usercomments"
       <p class="commentername">${json[comment].username}</p>
       <button id="clike${json[comment].id}" onclick="likeComment(${json[comment].id})" class="likecomment ${liked}"><i class="fa fa-thumbs-up"></i><span class="nclikes" id="nclikes${json[comment].id}">${json[comment].likes}</span></button>
       <p class="commenttime">${time.getDate()}.${time.getMonth()+1}.${time.getFullYear()} - ${time.getHours()}:${time.getMinutes()<10?'0':''}${time.getMinutes()} </p>
       <p class="commentcontent">${json[comment].text}</p>
  </div>
      
      `}
};

//The user has clicked on the delete button, issue a delete media request
const deleteMedia  = (event)=> {
  //Ask for confirmation
  const answer = confirm("Sure to delete?");
  if (answer) {
    //Get the id of the user that is issuing the request and the image id from the hidden input in the page
    getLoginState().then(res =>{
      const data= {
        'imageID': document.getElementById('mediaID').value,
        'userID' : res.userid,
      };
      return data;
    }).then((data) =>{
      const settings = { //Prepare the request
        method: 'DELETE',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        },};
      return settings;
    }).then((settings) => { //Issue the request
      return fetch(apiroot+'delete/media/id', settings).then(() => window.location.href = apiroot);
      })
  }

};

//Add a comment to the image
const postComment = (event) => {
  event.preventDefault();
  //Check who is the user commenting
  return getLoginState().then(res =>{ return  res.userid}).then((userid) => {
    if(!userid){
      throw new Error('you must be logged in to post a comment.')
    }
    const comment = { //Prepare the comment data
      comment : document.getElementById('comment').value,
      userID : userid,
      imageID: document.getElementById('mediaID').value,
    };
    console.log(comment);
    const settings = { //Prepare the comment request
      method: 'POST',
      body: JSON.stringify(comment),
      headers: {
        'Content-Type': 'application/json'
      },
    };
    //Issue the comment request
    return fetch(apiroot + 'post/comment', settings).then((res) =>{
      document.getElementById('comment').value = '';
      getComments()
    });
  }).catch((err) => alert(err));
};

//Add the event listeners for the comment and delete button
//(the like buttons event listeners are added through the onclick of the the generated html)
document.getElementById('commentForm').addEventListener('submit', postComment);
document.getElementById('btnDeleteMedia').addEventListener('click', deleteMedia);

//Execute the initial load event
onMediaPageLoad();


