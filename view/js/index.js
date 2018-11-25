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