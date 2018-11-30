

//send upload form
const mediaForm = document.querySelector('#mediaform');
const uploadImages = (event) => {
    console.log('uploading...');

    event.preventDefault();
    const formData = new FormData(mediaForm);
    const settings = {
        method: 'post',
        body: formData,
    };

    fetch('/upload', settings).then((response) =>{

        return response.json();

    }).then((json) =>{
        console.log(json);
        getImages();

    });
    console.log('uploading OK');


};

mediaForm.addEventListener('submit', uploadImages);

const getImages = () =>{
    console.log('getting images???');
    fetch('/images').then(response=>{
        return response.json();
    }).then(json =>{
        console.log(json);
        showImages(json);
    });
    console.log('getting images OK???');
};

const showImages = (images) => {
    console.log('showing images???');
    images.forEach(image=>{

     document.getElementById('uploadfile').style.display = 'none';

        const myMedia = document.querySelector('#myMedia');
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

    console.log('showing images OK???');

};


