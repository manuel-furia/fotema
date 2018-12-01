//search for content
const search = () =>{
    const searchText = document.querySelector('#searchForm input[name="search"]').value;

    console.log('search text: ' + searchText);

    const settings = {
        method: 'GET'
    };
    fetch(`/search/:${searchText}`, settings).then((response) => {
        return response.json();
    }).then((json) => {
        showSearchResults(json);
    });
};


const searchForm = document.getElementById('searchForm');
searchForm.addEventListener('submit', (event) => {event.preventDefault(); search();});



//show search results on front end
const showSearchResults = (images) => {
    console.log('showing showSearchResults ???');
    images.forEach(image=>{

        document.getElementById('showSearchResults').style.display = 'block';
        document.getElementById('showSearchResults').style.visibility = 'visible';


        const myMedia = document.querySelector('#showSearchResults');
        myMedia.innerHTML =

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
        </div>` + myMedia.innerHTML;

    });

    console.log('showing showSearchResults OK???');

};