'use strict';

function onPageLoad (){
  const imageID = document.getElementById('userID').value;
  fetch(apiroot + '/get/singleMedia/' + imageID).then(response => response.json()).then(json => {
   buildHTML(json);
  });
}

const buildHTML = (json) =>{
  const div = document.getElementById('mediaTarget');
  const liked = json.alreadyLiked ? 'likedlikesnumber' : '';
  div.innerHTML +=
`

        <div class="gallery">
            <h4 class="media-title"> ${json.title}</h4>
            <h5> by :  <a href="myfotema.html" class="media-owner"><strong> ${json.ownername}</strong></a></h5>
            <a target="_blank" href="${json.path}">
                <img src="${apiroot}${json.path}" width="" height="" alt="">
            </a>
        </div>

        <div class="desc">
            <p class="description">${json.description}</p>
            <p class="likesnumber ${liked}" id="like${json.id}"><button id="btnLike" onclick="likeMedia(${json.id})"><i class="fa fa-heart"></i></button><span id="nlikes${json.id}">${json.likes}</span></p>
            <p class="commentsnumber"><button id="btnComment"><i class="fa fa-commenting"></i></button> 0</p>
        </div>

    

  `
};

onPageLoad();



/*  <div class="usercomments">
      <p class="commentername">commenter name</p>
  <button class="likecomment"><i class="fa fa-thumbs-up"></i>  5k </button>
  <p class="commenttime">4 hr </p>
  <p class="commentcontent">this is great!!</p>




<div class="usercomments">
      <p class="commentername">commenter name</p>
  <button class="likecomment"><i class="fa fa-thumbs-up"></i>  500 </button>
  <p class="commenttime">4 hr </p>
  <p class="commentcontent">this is great!! great great great great great great great great hitehitheitheihteihtiehighdigh hitehitheitheihteihtiehighdigh hitehitheitheihteihtiehighdigh</p>
  </div>

  <div class="usercomments">
      <p class="commentername">commenter name</p>
  <button class="likecomment"><i class="fa fa-thumbs-up"></i>  5k </button>
  <p class="commenttime">4 hr </p>
  <p class="commentcontent">this is great!!</p>
  </div>

  <div class="usercomments">
      <p class="commentername">commenter name</p>
  <button class="likecomment"><i class="fa fa-thumbs-up"></i>  105k</button>
  <p class="commenttime">4 hr </p>
  <p class="commentcontent">this is great!!</p>
  </div>
  </div>*/
