
//show image after user has chosen one, before uploading
const readURL = (input) => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            $('#newImage')
                .attr('src', e.target.result)
                .width(300)
                .height('auto');
        };

        reader.readAsDataURL(input.files[0]);
    }
};



const showUploadForm = () =>{
    if (window.location.href.indexOf("#uploadfile?show") !== -1) {
        const uploadfileForm = document.getElementById('uploadfile');
        console.log('show upload dialog');
        uploadfileForm.style.display = "block";
    }

    if(window.location.href.indexOf('#showSearchResults?show') !==-1){
        const showSearchResults = document.getElementById('showSearchResults');
        showSearchResults.style.display = "block";
    }

};

showUploadForm();


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


//get images
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


//show images on frontend
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

