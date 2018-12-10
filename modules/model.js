const db = require('./database')
const bcrypt = require('bcrypt');

const saltRounds = 10;
let connection = null;

const LVL_NONE = 0;
const LVL_NORMAL = 1;
const LVL_MOD = 2;
const LVL_ADMIN = 3;

const USR_NOT_FOUND = 'User not found';
const EMAIL_NOT_FOUND = 'Email not found';
const PERMISSION_DENIED = 'Permission denied';
const WRONG_CREDENTIAL = 'Wrong username or password';

const userType = ['none', 'normal', 'mod', 'admin']; 

const executableAsUser = requiredlvl => f => (actorId, targetOwnerId, ...args) => {
    return getPermissions(actorId).then(lvl => {
        if (lvl >= requiredlvl(actorId, targetOwnerId)){
            console.log('succes!');
            return f(...args);
        } else {
            throw new Error(PERMISSION_DENIED);
        }
    });  
}

const normalAction = executableAsUser((actor, owner) => (actor === owner) ? LVL_NORMAL : LVL_MOD);
const adminAction = executableAsUser((actor, owner) => (actor === owner) ? LVL_NORMAL : LVL_ADMIN);


const zipWith = (xs, ys, f) => xs.map((n,i) => f(n, ys[i]))

//Fisher-Yates shuffle algorithm
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;   
}

const checkConnect = f => (...args) => {
    if (connection === null || connection.status === 'disconnected'){
        connection = db.connect();
    }
    return f(...args);
}

const getPermissions = (userId) => {
    return db.getDataFromAttribute(connection, 'UserInfo', 'id', userId).then(users => {
        if (users.length == 1){
            return users[0].level;
        } else {
            reject(USR_NOT_FOUND);
        }
    })
}

const getMediasByAnonRelevance = (start, amount) => {
    return db.getMediasOrderedByImpact(connection, start, amount);
}

const getMediasByUserRelevance = (start, amount, userId) => {
    const probs = [0.30, 0.20, 0.10, 0.10, 0.05];
    const nums = probs.map(x => Math.round(x * amount));
    const nRandTags = 3;
    const rest = Math.round(amount*(1.0 - probs.reduce((s, x) => s + x, 0)) / nRandTags);

    const zipfDist = (amount) => {
        const max = Math.log(amount);
        const rnd = Math.round(Math.exp(Math.random() * max));
        return Math.max(Math.min(rnd, amount-1), 0);
    }    

    return db.getUserFavouriteTags(connection, userId, 0, 1000000).then((elems) => {
        return elems.map(elem => elem.tag);
    }).then(tags => {
        const getRandomTag = () => {
            return tags[Math.floor(tags.length * Math.random())];
        };
        const randomTags = Array(nRandTags).fill(0).map(x => getRandomTag());
        const selectedTags = tags.slice(0, nums.length).concat(randomTags);
        return Promise.all(selectedTags.map(tag => {
                return db.getNumberOfMediasByTag(connection, tag).then((tagnum) => {
                if (tagnum.length > 0) return tagnum[0];
                else return {};
            });
        }));
    }).then(tags => {
        return Promise.all(tags.filter(x => x !== {}).map((tag, index) => {
            const selected = zipfDist(tag.num);
            const howMany = index < nums.length ? nums[index] : rest;
            return db.getTagMediasOrderedByImpactForUser(connection, tag.name, userId, selected, howMany);
        }));
    }).then(results => {
        const flattenRes = results.flat();
        return shuffle(flattenRes);
    });
}

const deleteMedia = (id) => {
    return db.deleteMedia(connection, id);
}

const uploadMedia = (data) => {
    data.capturetime = convertUTCDateToLocalDate(data.capturetime);
    data.uploadtime = convertUTCDateToLocalDate(data.uploadtime);
    return db.uploadMedia(connection, data, (result) => resolve(result));
}

const getMediaInfo = (id) => {
    return db.getMediaInfo(connection, id);
}

const likeMedia = (userId, mediaId) => {
    return db.isMediaAlreadyLikedBy(connection, userId, mediaId).then((liked) => {
        if (liked) {
            return {err: "Already liked"};
        } else {
            const time = convertUTCDateToLocalDate(new Date());
            return db.likeMedia(connection, mediaId, userId, time);
        }
    });
}

const unlikeMedia = (userId, mediaId) => {
    return db.unlikeMedia(connection, mediaId, userId);
}

const createComment = (text, userID, time, targetMedia) => {
    return db.createComment(connection, text, userID, convertUTCDateToLocalDate(time), targetMedia);
}

const getUserId = (username) => {
    return new Promise((resolve, reject) => {
        db.getDataFromAttribute(connection, 'UserInfo', 'username', username).then((result) => {
            if (result != null && result.length > 0)   
                resolve(result[0].id);
            else 
                reject(USR_NOT_FOUND);
        });
    });
}

const getUserIdFromEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.getDataFromAttribute(connection, 'UserInfo', 'email', email).then((result) => {
            if (result != null && result.length > 0)   
                resolve(result[0].id);
            else 
                reject(EMAIL_NOT_FOUND);
        });
    });
}

const hashPass = (pass, salt) => {
    return bcrypt.hash(pass, salt);
}

const createUser = (username, email, pass, profilepicture = null) => {
    const psalt = bcrypt.genSalt(saltRounds);

    const ppass = psalt.then((salt) => {
        return bcrypt.hash(pass, salt);
    });

    return Promise.all([psalt, ppass]).then(([salt, hash]) => {
        db.createUser(connection, username, email, hash, salt, LVL_NORMAL, profilepicture);
    });
}

const getNumCommentsFromMedia = (mediaID) => {
    return db.getNumCommentsFromMedia(connection, mediaID);
}

const validUserEmailPair = (username, email) => {
    const userExists = getUserId(username).then(() => true).catch((err) => {
        if (err === USR_NOT_FOUND)
            return false;
        throw new Error(err);    
    });
    const emailExists = getUserIdFromEmail(email).then(() => true).catch((err) => {
        if (err === EMAIL_NOT_FOUND)
            return false;
        throw new Error(err);    
    });
    
    return Promise.all([userExists, emailExists]).then(([u, e]) => {return {valid: !(u || e), userTaken: u, emailTaken: e};});
}

const getCommentsFromMedia = (mediaID) => {
    return db.getCommentsFromMedia(connection, mediaID);
}

const getCommentsFromMediaForUser = (mediaID, userID) => {
    return db.getCommentsFromMedia(connection, mediaID, userID);
}

const checkUserLogin = (username, pass) => {
    const user = new Promise((resolve, reject) => {
        db.getDataFromAttribute(connection, 'UserInfo', 'username', username).then((result) => {
            if (result != null && result.length > 0)   
                resolve(result[0]);
            else 
                reject(USR_NOT_FOUND);
        });
    });

    const pHash = user.then(user => {
        const salt = user.salt;
        return bcrypt.hash(pass, salt);
    });

    return Promise.all([user, pHash]).then(([user, hash]) => {
       if (user.passhash === hash){
            return {username: user.username, type: userType[user.level]};
       } else {
            return {err: WRONG_CREDENTIAL};
       }
    }).catch(err => {if (err === USR_NOT_FOUND) return {err: USR_NOT_FOUND}; else throw(err)});
}

module.exports = {
    getMediasByAnonRelevance: checkConnect(getMediasByAnonRelevance),
    getMediasByUserRelevance: checkConnect(getMediasByUserRelevance),
    deleteMedia: checkConnect(deleteMedia),
    uploadMedia: checkConnect(uploadMedia),
    getUserId: checkConnect(getUserId),
    createUser: checkConnect(createUser),
    getNumCommentsFromMedia: checkConnect(getNumCommentsFromMedia),
    getMediasByUserRelevance: checkConnect(getMediasByUserRelevance),
    getUserIdFromEmail: checkConnect(getUserIdFromEmail),
    validUserEmailPair: checkConnect(validUserEmailPair),
    getCommentsFromMedia: checkConnect(getCommentsFromMedia),
    getCommentsFromMediaForUser: checkConnect(getCommentsFromMediaForUser),
    actorDeleteMedia: checkConnect(normalAction(deleteMedia)),
    checkUserLogin: checkConnect(checkUserLogin),
    getMediaInfo: checkConnect(getMediaInfo),
    createComment: checkConnect(createComment),
    likeMedia: checkConnect(likeMedia),
    unlikeMedia: checkConnect(unlikeMedia)
};
