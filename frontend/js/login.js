const maxLoginDurationInDays = 3;
const usernameCookie = 'user'
const userTypeCookie = 'type'

const isLoggedIn = () => {
    return getLoginState().then(loginState => loginState.username != undefined && loginState.username != null && loginState.username != '');
};

const getUsername = () => {
    return getLoginState().then((loginState) => {
        if (loginState && loginState.username != null && loginState.username !== "")
            return loginState.username;
        else
            throw new Error ('You must log in first.');
    });
};

const getUserId = () => {
    return getLoginState().then((loginState) => {
        if (loginState && loginState.userid != null && loginState.userid !== "")
            return loginState.userid;
        else
            throw new Error ('You must log in first.');
    });
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
