const maxLoginDurationInDays = 3;
const usernameCookie = 'user'
const userTypeCookie = 'type'

//Return a promise resolving to true if the user is logged in
const isLoggedIn = () => {
    return getLoginState().then(loginState => loginState.username != undefined && loginState.username != null && loginState.username != '');
};

//Return a promise resolving to the user's username if the user is logged in
const getUsername = () => {
    return getLoginState().then((loginState) => {
        if (loginState && loginState.username != null && loginState.username !== "")
            return loginState.username;
        else
            throw new Error ('You must log in first.');
    });
};

//Return a promise resolving to the user's id if the user is logged in
const getUserId = () => {
    return getLoginState().then((loginState) => {
        if (loginState && loginState.userid != null && loginState.userid !== "")
            return loginState.userid;
        else
            throw new Error ('You must log in first.');
    });
};

//Show the appropriate header buttons according to the login state
const updateHeader = () => {
    isLoggedIn().then(loggedIn => {
        if (loggedIn){
            document.querySelectorAll('.logged').forEach(x => x.style.display = 'inline');
            document.querySelectorAll('.profile').forEach(x => x.style.display = 'inline');
            document.querySelectorAll('.anon').forEach(x => x.style.display = 'none');
            getUsername().then(username => {
                document.getElementById('usernameText').innerText = username;
            });
        } else {
            document.querySelectorAll('.logged').forEach(x => x.style.display = 'none');
            document.querySelectorAll('.profile').forEach(x => x.style.display = 'none');
            document.querySelectorAll('.anon').forEach(x => x.style.display = 'inline');
            document.getElementById('usernameText').innerText = 'username';
        }
    });
};
