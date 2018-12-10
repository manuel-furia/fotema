//import {apiroot} from '../api/apiconf.js';

'use strict';
const showImages = (images) => {
    console.log('showing images???');
    images.forEach(media=>{
//<img src="${apiroot + media.thumbpath}" width="" height=""  class="clickedMedia" id="${media.id}" >
//<div class="galleryImage" style="background-image: url('${apiroot + media.thumbpath}')" id="${media.id}"></div>
    // document.getElementById('uploadfile').style.display = 'none';

        const myMedia = document.getElementById('imageTarget');
        const liked = media.alreadyLiked ? 'likedlikesnumber' : '';
        myMedia.innerHTML +=
        ` <div class="responsive" >
            <a target="_blank" href="media/${media.id}">
              <div class="gallery">
                <img src="${apiroot + media.thumbpath}" width="" height=""  class="clickedMedia galleryImage" id="${media.id}" >
              </div>
            </a>
                  <div class="desc">
                      <p class="description">${media.description}</p>
                      <p class="likesnumber ${liked}" id="like${media.id}"><button onclick="likeMedia(${media.id})"><i class="fa fa-heart"></button></i><span id="nlikes${media.id}">${media.likes}</span></p>
                      <p class="commentsnumber"><button><i class="fa fa-commenting"></button></i> ${media.comments}</p>
                  </div>
              
          </div>` ;

        //div of new image box
        /*
        <div class="responsive">
                <div class="gallery">
                    <a target="_blank" href="../image/f1.jpg">
                        <img src="../image/f1.jpg" width="" height="" alt="">
                    </a>
                </div>
                <div class="desc">
                    <p class="description">description of the image </p>
                    <p class="likesnumber"><button  onclick="likeMedia()"><i class="fa fa-heart"></i></button> 100000</p>
                    <p class="commentsnumber"><button  onclick="commentMedia()"><i class="fa fa-commenting"></i></button> 900</p>
                </div>
            </div>
        */

     // console.log('html: ' + myMedia.innerHTML);
    });


    console.log('showing images OK???');
};

//show search results on front end
const showSearchResults = (images) => {
  console.log('showing showSearchResults ???');
  images.forEach(image=>{

    document.getElementById('showSearchResults').style.display = 'block';
    document.getElementById('showSearchResults').style.visibility = 'visible';


    const searchResults = document.querySelector('#firstBlockSearchResults');
    searchResults.innerHTML =

        `<div class="responsive">
          <div class="gallery">
            <a  target="_blank" href="uploads/${image.original}">
            <img src='thumbs/${image.thumbnail}'>
            </a>
            <div class="desc">
                <p class="description">description</p>
                <p class="likes"><i class="fa fa-heart"></i> ${image.likes}</p>
                <p class="comments"><i class="fa fa-commenting">${image.comments}</i></p>
            </div>
          </div>
        </div>` + searchResults.innerHTML;

  });

  console.log('showing showSearchResults OK???');
};


