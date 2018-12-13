//Profile picture and account settings
//NOT IMPLEMENTED JET

//show image after user has chosen one for new profile photo, before uploading
const previewProfileImage = (input) => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            $('#newProfileImage')
                .attr('src', e.target.result)
                .width(80)
                .height('auto');
        };

        reader.readAsDataURL(input.files[0]);
    }
};



const deleteAccount = () => {
    var txt;
    const answer = confirm("Sure to delete?");
    if (answer === true) {
        //todo delete media
        txt = "You pressed OK!";
    } else {
        //do nothing?
        txt = "You pressed Cancel!";
    }
    alert(txt) ;
};
