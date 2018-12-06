const deleteMedia = () => {
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



const showUpdateForm = () =>{
    const updateForm = document.getElementById('updateForm');
    updateForm.style.display = 'block';
};


const cancelUpdate = () =>{
    const updateForm = document.getElementById('updateForm');
    updateForm.style.display = 'none';

};
