
//show image after user has chosen one, before uploading
/*const previewMedia = (input) => {
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
};*/



const showUploadForm = () =>{
    const uploadfileForm = document.querySelector('#uploadfile');
    console.log('show upload dialog');
    uploadfileForm.style.display = "block";
};



/*const showUploadForm = () =>{
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

showUploadForm();*/


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
if (mediaForm != null) {
    mediaForm.addEventListener('submit', uploadImages);
}


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


