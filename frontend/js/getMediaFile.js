'use strict';

function onPageLoad (){
  const imageID = document.getElementById('userID').value;
  fetch(apiroot + 'get/media/' + imageID).then(response => response.json()).then(json => {
 //   console.log(json);
   buildImage(json);
  });

  fetch(apiroot + 'get/comments/' + imageID).then(response => response.json()).then(json => {
    console.log(json);
    buildComments(json);
  });

}

const buildImage = (json) =>{
  const div = document.getElementById('mediaTarget');
  const liked = json.alreadyLiked ? 'likedlikesnumber' : '';
  div.innerHTML +=
`

        <div class="gallery">
            <h4 class="media-title"> ${json.title}</h4>
            <h5> by :  <a href="myfotema.html" class="media-owner"><strong> ${json.ownername}</strong></a></h5>
            <img src="${apiroot}${json.path}" width="" height="" alt="">
        </div>

        <div class="desc">
            <p class="description">${json.description}</p>
            <p class="likesnumber ${liked}" id="like${json.id}"><button id="btnLike" onclick="likeMedia(${json.id})"><i class="fa fa-heart"></i></button><span class="nlikes" id="nlikes${json.id}">${json.likes}</span></p>
            <p class="commentsnumber"><button id="btnComment"><i class="fa fa-commenting"></i></button> 0</p>
        </div>

  `
};


const buildComments = (json) =>{
  const div = document.getElementById('commentBlock');
  for(let comment in json){
    let time = new Date(json[comment].time);
  div.innerHTML += `
      
  <div class="usercomments"
       <p class="commentername">${json[comment].user}</p>
       <button class="likecomment"><i class="fa fa-thumbs-up"></i> ${json[comment].likes}</button>
       <p class="commenttime">${time.getDate()}.${time.getMonth()}.${time.getFullYear()} - ${time.getHours()}:${time.getMinutes()<10?'0':''}${time.getMinutes()} </p>
       <p class="commentcontent">${json[comment].text}</p>
  </div>
      
      `}
};

const postComment = (event) => {
  event.preventDefault();

  return getLoginState().then(res =>{ return  res.username}).then((username) => {
    const comment = {
      comment : document.getElementById('comment').value,
      username : username,
    };
    const settings = {
      method: 'POST',
      body: JSON.stringify(comment),
      headers: {
        'Content-Type': 'application/json'
      },
    };
    return fetch(apiroot + 'post/comment', settings);
  });

};

document.getElementById('commentForm').addEventListener('submit', postComment);



onPageLoad();


