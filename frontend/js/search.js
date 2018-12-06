const showSearchContainerOnMobile = () => {
        const btnSearchMobile = document.getElementById('btnSearchMobile');
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer.style.display === 'block'){
            searchContainer.style.display = 'none';
            btnSearchMobile.innerHTML = '<i class="fa fa-search"></i>';
        } else {
            searchContainer.style.display = 'block';
            btnSearchMobile.innerHTML = '<i class="fa fa-times"></i>';

    }
};




