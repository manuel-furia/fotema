const maxLoginDurationInDays = 3;
const usernameCookie = 'user'
const userTypeCookie = 'type'

/*
const onLogIn = (username, type) => {
    setCookie(usernameCookie, username, maxLoginDurationInDays);
    setCookie(userTypeCookie, type, maxLoginDurationInDays);
};

const onLogOut = () => {
    deleteCookie(usernameCookie);
    deleteCookie(userTypeCookie);
};

const isLoggedIn = () => {
    const username = getCookie(usernameCookie);
    return username != undefined && username != null && username != "";
};*/

const isLoggedIn = () => {
    return getLoginState().then(loginState => loginState.username != undefined && loginState.username != null && loginState.username != '');
};

const updateHeader = () => {
    isLoggedIn().then(loggedIn => {
        if (loggedIn){
            document.querySelectorAll('.logged').forEach(x => x.style.display = 'inline');
            document.querySelectorAll('.profile').forEach(x => x.style.display = 'inline');
            document.querySelectorAll('.anon').forEach(x => x.style.display = 'none');
        } else {
            document.querySelectorAll('.logged').forEach(x => x.style.display = 'none');
            document.querySelectorAll('.profile').forEach(x => x.style.display = 'none');
            document.querySelectorAll('.anon').forEach(x => x.style.display = 'inline');
        }
    });
};
