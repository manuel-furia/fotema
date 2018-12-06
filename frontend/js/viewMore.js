//hide footer on scroll down
let prevScrollpos = window.pageYOffset;
window.onscroll = ()=> {
    const currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
        document.getElementById("footer").style.bottom = "0px";
    } else {
        document.getElementById("footer").style.bottom = "-80px";
    }
    prevScrollpos = currentScrollPos;
};





//click view more media content 
const viewMore = () => {
    const moreContent = document.getElementById("morecontent");
    const btnViewMore = document.getElementById("btnViewMore");

    if (moreContent.style.display === "flex") {
        btnViewMore.innerHTML = "view more";
        moreContent.style.display = "none";
    } else {
        btnViewMore.innerHTML = "view less";
        moreContent.style.display = "flex";
    }
};


//view more my-media
const viewMoreMyMedia = () => {
    const viewMoremyMedia = document.getElementById("viewMoremyMedia");
    const btnViewMoreMyMedia = document.getElementById("btnViewMoreMyMedia");

    if (viewMoremyMedia.style.display === "flex") {
        btnViewMoreMyMedia.innerHTML = "view more";
        viewMoremyMedia.style.display = "none";
    } else {
        btnViewMoreMyMedia.innerHTML = "view less";
        viewMoremyMedia.style.display = "flex";
    }
};

//view more search-results
const viewMoreSearchResults = () => {
    const viewMoreSearchResults = document.getElementById("viewMoreSearchResults");
    const btnViewMoreSearchResults = document.getElementById("btnViewMoreSearchResults");

    if (viewMoreSearchResults.style.display === "flex") {
        btnViewMoreSearchResults.innerHTML = "view more";
        viewMoreSearchResults.style.display = "none";
    } else {
        btnViewMoreSearchResults.innerHTML = "view less";
        viewMoreSearchResults.style.display = "flex";
    }
};


