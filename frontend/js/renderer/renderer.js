//import {apiroot} from '../api/apiconf.js';

'use strict';
const showImages = (images, target = 'imageTarget') => {
    if(target === 'searchResults'){
        document.getElementById('searchResultsContainer').style.display = 'block';
        document.getElementById('searchResultsContainer').style.visibility = 'visible';
    }
    images.forEach(media=>{
        const search = target === 'searchResults';
        const mediaTarget = document.getElementById(target);
        const liked = media.alreadyLiked ? 'likedlikesnumber' : '';
        const present = document.getElementById(`media${media.id}`);

        if (!present || search){
            mediaTarget.innerHTML +=
        ` <div class="responsive" >
            <a href="media/${media.id}">
              <div class="gallery">
                <img src="${apiroot + media.thumbpath}" width="" height=""  class="clickedMedia galleryImage" id="media${media.id}" >
              </div>
            </a>
                  <div class="desc">
                      <p class="description">${media.description}</p>
                      <p class="likesnumber ${liked}" id="like${media.id}"><button onclick="likeMedia(${media.id})"><i class="fa fa-heart"></button></i><span id="nlikes${media.id}">${media.likes}</span></p>
                      <p class="commentsnumber"><button><i class="fa fa-commenting"></button></i> ${media.comments}</p>
                  </div>
              
          </div>` ;
        }
    });
};

//show search results on front end
const showSearchResults = (images) => {
  
console.log("OOOOOK");

  document.getElementById('searchResultContainer').style.display = 'block';
  document.getElementById('searchResultContainer').style.visibility = 'visible';

  images.forEach(image=>{


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


