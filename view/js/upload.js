
//show image after user has chosen one, before uploading
function readURL(input) {
    if (input.files && input.files[0]) {
        let reader = new FileReader();

        reader.onload = function (e) {
            $('#newImage')
                .attr('src', e.target.result)
                .width(300)
                .height(auto);
        };

        reader.readAsDataURL(input.files[0]);
    }
}