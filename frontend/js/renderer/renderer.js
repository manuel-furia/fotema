//import {apiroot} from '../api/apiconf.js';

'use strict';
const showImages = (images, target = 'imageTarget') => {
    console.log('showing images???');
    images.forEach(media=>{
        const myMedia = document.getElementById(target);
        const liked = media.alreadyLiked ? 'likedlikesnumber' : '';
        myMedia.innerHTML +=
        ` <div class="responsive" >
            <a href="media/${media.id}">
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


