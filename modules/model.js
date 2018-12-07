const db = require('./database')
const bcrypt = require('bcrypt');

const saltRounds = 10;
let connection = null

const checkConnect = f => (...args) => {
    if (connection === null || connection.status === 'disconnected'){
        connection = db.connect();
    }
    return f(...args);
}

const getMediasByAnonRelevance = (start, limit) => {
    return db.getMediasOrderedByImpact(connection, start, limit);
}

const getMediasByUserRelevance = (start, limit, user) => {
    //TODO: Implement user specific relevance algorithm
    return db.getMediasOrderedByImpact(connection, start, limit);
}

const deleteMedia = (id) => {
    return db.deleteMedia(connection, id);
}

const uploadMedia = (data) => {
    return db.uploadMedia(connection, data, (result) => resolve(result));

}

const getUserId = (username) => {
    return new Promise((resolve, reject) => {
        db.getDataFromAttribute(connection, 'UserInfo', 'username', username).then((result) => {
            if (result != null && result.length > 0)   
                resolve(result[0].id);
            else 
                reject('User not found');
        });
    });
}

const createUser = (username, email, pass, profilepicture = null) => {
    const psalt = bcrypt.genSalt(saltRounds);

    const ppass = psalt.then((salt) => {
        return bcrypt.hash(pass, salt);
    });

    return Promise.all([psalt, ppass]).then(([salt, hash]) => {
        db.createUser(connection, username, email, hash, salt, profilepicture);
    });
}

const getNumCommentsFromMedia = (mediaID) => {
    return db.getCommentsFromMedia(connection, mediaID);
}


const getUserIDFromUsername = (username) => {
    return db.getUserIDFromUsername(connection, username);
}

const getUserIDFromEmail = (email) => {
    return db.getUserIDFromEmail(connection, email);
}

const validUserEmailPair = (username, email) => {
    const userExists = getUserIDFromUsername(username).then((res) => res.length > 0);
    const emailExists = getUserIDFromEmail(email).then((res) => res.length > 0);
    
    return Promise.all([userExists, emailExists]).then(([u, e]) => {valid: !(u || e), userTaken: u, emailTaken: e});
}

module.exports = {
    getMediasByAnonRelevance: checkConnect(getMediasByAnonRelevance),
    deleteMedia: checkConnect(deleteMedia),
    uploadMedia: checkConnect(uploadMedia),
    getUserId: checkConnect(getUserId),
    createUser: checkConnect(createUser),
    getNumCommentsFromMedia: checkConnect(getNumCommentsFromMedia),
    getMediasByUserRelevance: checkConnect(getMediasByUserRelevance),
    getUserIDFromUsername: checkConnect(getUserIDFromUsername),
    getUserIDFromEmail: checkConnect(getUserIDFromEmail),
    validUserEmailPair: checkConnect(validUserEmailPair)
};
