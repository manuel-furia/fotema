import * as cookies from './utils/cookies.js'

const maxLoginDurationInDays = 3;
const usernameCookie = 'user'
const userTypeCookie = 'type'

export const loggedIn = (username, type) => {
    cookies.setCookie(usernameCookie, username, maxLoginDurationInDays);
    cookies.setCookie(userTypeCookie, type, maxLoginDurationInDays);
}

export const loggedOut = () => {
    cookies.deleteCookie(usernameCookie);
    cookies.deleteCookie(userTypeCookie);
}
