//hide footer on scroll down
let prevScrollpos = window.pageYOffset;
window.onscroll = function() {
    const currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
        document.getElementById("footer").style.bottom = "0px";
    } else {
        document.getElementById("footer").style.bottom = "-80px";
    }
    prevScrollpos = currentScrollPos;
};


//click vire more button to load more content
const viewMore = () => {
    let moreContent = document.getElementById("morecontent");
    let btnViewMore = document.getElementById("btnViewMore");

    if (moreContent.style.display === "block") {
        btnViewMore.innerHTML = "view more";
        moreContent.style.display = "none";
    } else {
        btnViewMore.innerHTML = "view less";
        moreContent.style.display = "block";
    }
};



//TODO
//for the menu buttons, if user has signed in, show myfotema and upload
//else show signin and sign up