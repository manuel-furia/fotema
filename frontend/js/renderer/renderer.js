'use strict';
const showImages = (images, target = 'imageTarget') => {
    const isSearch = target === 'searchResults';
    const mediaTarget = document.getElementById(target);
    if(isSearch){
        mediaTarget.innerHTML = ""; //Delete previous searches
        document.getElementById('searchResultsContainer').style.display = 'block';
        document.getElementById('searchResultsContainer').style.visibility = 'visible';
    }
    images.forEach(media=>{
        const liked = media.alreadyLiked ? 'likedlikesnumber' : '';
        const present = document.getElementById(`media${media.id}`);

        if (!present || isSearch){
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


