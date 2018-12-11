'use strict';

function onMediaPageLoad (){
  getImage().then(() => getComments()).then(() => deleteButton());

}

const deleteButton = () => {
  const deleteButton = document.getElementById('btnDeleteMedia');
  deleteButton.style.display ='none';
  getLoginState().then(res =>{
    
    const data= {
      'id' : res.userid,
      'type' : res.type,
      'posterID': document.getElementById('posterID').value,
    };
    return data;
  }).then((data) => {
    const deleteButton = document.getElementById('btnDeleteMedia');
    if(data.id === parseInt(data.posterID, 10) || data.type == 'admin'){
      console.log('showing delete button. posterID: '+data.posterID + ' and loginID: ' + data.id);
      deleteButton.style.display = '';
    }else{
      console.log('not showing delete button. posterID: '+data.posterID + ' and loginID: ' + data.id);
      deleteButton.style.display ='none';
    }

  }).catch((err) => console.log(err))};


const getImage =() =>{
  const imageID = document.getElementById('userID').value;
  const settings = {
    method: 'GET'
  };
  return fetch(apiroot + 'get/media/' + imageID, settings).then(response => response.json()).then(json => {
    buildImage(json);
  });
};

const getMediaLiked =() =>{
  const imageID = document.getElementById('userID').value;
  const settings = {
    method: 'GET'
  };
  return fetch(apiroot + 'get/medialiked/' + imageID, settings).then(response => response.json());
};

const getComments = () =>{
  const imageID = document.getElementById('userID').value;
  const settings = {
    method: 'GET'
  };
  return fetch(apiroot + 'get/comments/' + imageID, settings).then(response => response.json()).then(json => {
    buildComments(json);
  });
};

const buildImage = (json) =>{
  const div = document.getElementById('mediaTarget');

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


const buildComments = (json) =>{
  const div = document.getElementById('commentBlock');
  div.innerHTML = '';
  for(let comment in json){
    let time = new Date(json[comment].time);

 const liked = json[comment].alreadyLiked ? 'likedcommentsnumber' : '';

  div.innerHTML += `
      
  <div class="usercomments"
       <p class="commentername">${json[comment].username}</p>
       <button id="clike${json[comment].id}" onclick="likeComment(${json[comment].id})" class="likecomment ${liked}"><i class="fa fa-thumbs-up"></i><span class="nclikes" id="nclikes${json[comment].id}">${json[comment].likes}</span></button>
       <p class="commenttime">${time.getDate()}.${time.getMonth()}.${time.getFullYear()} - ${time.getHours()}:${time.getMinutes()<10?'0':''}${time.getMinutes()} </p>
       <p class="commentcontent">${json[comment].text}</p>
  </div>
      
      `}
};

const deleteMedia  = (event)=> {

  const answer = confirm("Sure to delete?");
  if (answer) {
    //todo delete media
    getLoginState().then(res =>{
      const data= {
        'imageID': document.getElementById('userID').value,
        'userID' : res.userid,
      };
      return data;
    }).then((data) =>{
      const settings = {
        method: 'DELETE',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        },};
      return settings;
    }).then((settings) => {
      return fetch(apiroot+'delete/media/id', settings).then(() => window.location.href = apiroot);
      })
  }

};

const postComment = (event) => {
  event.preventDefault();

  return getLoginState().then(res =>{ return  res.userid}).then((userid) => {
    if(!userid){
      throw new Error('you must be logged in to post a comment.')
    }
    const comment = {
      comment : document.getElementById('comment').value,
      userID : userid,
      imageID: document.getElementById('userID').value,
    };
    console.log(comment);
    const settings = {
      method: 'POST',
      body: JSON.stringify(comment),
      headers: {
        'Content-Type': 'application/json'
      },
    };
    return fetch(apiroot + 'post/comment', settings).then((res) =>{
      document.getElementById('comment').value = '';
      getComments()
    });
  }).catch((err) => alert(err));
};

document.getElementById('commentForm').addEventListener('submit', postComment);
document.getElementById('btnDeleteMedia').addEventListener('click', deleteMedia);


onMediaPageLoad();


