const db = require('./database')
const bcrypt = require('bcrypt');

//Salt rounds for the hashing algorithms (2^saltRounds)
const saltRounds = 10;
let connection = null;

//Priviledge levels
const LVL_NONE = 0;
const LVL_NORMAL = 1;
const LVL_MOD = 2;
const LVL_ADMIN = 3;

//Error messages
const USR_NOT_FOUND = 'User not found';
const EMAIL_NOT_FOUND = 'Email not found';
const PERMISSION_DENIED = 'Permission denied';
const WRONG_CREDENTIAL = 'Wrong username or password';

//Types of users associated with the priviledge levels
const userType = ['none', 'normal', 'mod', 'admin']; 

//Decorate a function to be executed on behalf of a user (it will check for user permission before executing it)
const executableAsUser = requiredlvl => f => (actorId, targetOwnerId, ...args) => {
    return getPermissions(actorId).then(lvl => {
        if (lvl >= requiredlvl(actorId, targetOwnerId)){
            return f(...args);
        } else {
            throw new Error(PERMISSION_DENIED);
        }
    });  
}

//Decorate a function to be executable by the user that owns the media or by a moderator
const normalAction = executableAsUser((actor, owner) => (actor === owner) ? LVL_NORMAL : LVL_MOD);
//Decorate a function to be executable by the user that owns the media or by an admin
const adminAction = executableAsUser((actor, owner) => (actor === owner) ? LVL_NORMAL : LVL_ADMIN);

//The zipWith function (transform two list into a list by applying a function for each pair of element at a certain index)
//In pseudocode: result[i] := f(x[i], y[i])
const zipWith = (xs, ys, f) => xs.map((n,i) => f(n, ys[i]))

//Fisher-Yates shuffle algorithm
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

//Convert a utc date to local date to store it in the DB (as mariadb converts it back to utc)
function convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;   
}

//Decorate a function to check if there is database connection before executing it
//If there is no connection, it establishes it
const checkConnect = f => (...args) => {
    if (connection === null || connection.status === 'disconnected'){
        connection = db.connect();
    }
    return f(...args);
}

//Get a promise containing the permission level of a user
const getPermissions = (userId) => {
    return db.getDataFromAttribute(connection, 'UserInfo', 'id', userId).then(users => {
        if (users.length == 1){
            return users[0].level;
        } else {
            reject(USR_NOT_FOUND);
        }
    })
}

//Get a promise containing the medias ordered by relevance for an anonymous user (ordered by descending impact)
const getMediasByAnonRelevance = (start, amount) => {
    return db.getMediasOrderedByImpact(connection, start, amount);
}

/* Get a promise containing the medias ordered by relevance for a logged in user
 * It draws from the five most relevant tags for the user plus 3 random tags
 * Within each tag, the images are drawn probabilistically according to a Zipf distribution
*/
const getMediasByUserRelevance = (start, amount, userId) => {
    //Proportions of images coming from the 5 most relevant tags (where 1.0 = 100%)
    const probs = [0.30, 0.20, 0.10, 0.10, 0.05];
    //Compute the amount of images for each tag
    const nums = probs.map(x => Math.round(x * amount));
    //The amount of random tags to add to te 5 most relevant tags
    const nRandTags = 3;
    //The remaining amount of images that will be drawn from the random tags
    const rest = Math.round(amount*(1.0 - probs.reduce((s, x) => s + x, 0)) / nRandTags);
    
    //The cumulative Zipf distribution
    const zipfDist = (amount) => {
        const max = Math.log(amount);
        const rnd = Math.round(Math.exp(Math.random() * max));
        return Math.max(Math.min(rnd, amount-1), 0);
    }    

    //Get up to the first 1 billion tags ordered by descending relevance for the user
    return db.getUserFavouriteTags(connection, userId, 0, 1000000).then((elems) => {
        return elems.map(elem => elem.tag);
    }).then(tags => {
        //To get a random tag
        const getRandomTag = () => {
            return tags[Math.floor(tags.length * Math.random())];
        };
        //Collect an amoun of random tags
        const randomTags = Array(nRandTags).fill(0).map(x => getRandomTag());
        //Get the first nums most relevant tags
        const selectedTags = tags.slice(0, nums.length).concat(randomTags);
        //Get the amount of medias for each of the selected tags
        return Promise.all(selectedTags.map(tag => {
                return db.getNumberOfMediasByTag(connection, tag).then((tagnum) => {
                if (tagnum.length > 0) return tagnum[0];
                else return {};
            });
        }));
    }).then(tags => {
        //Select the appropriate amount of random images from each tag, distributed by relevance according to the Zipf law
        return Promise.all(tags.filter(x => x !== {}).map((tag, index) => {
            const selected = zipfDist(tag.num);
            const howMany = index < nums.length ? nums[index] : rest;
            return db.getTagMediasOrderedByImpactForUser(connection, tag.name, userId, selected, howMany);
        }));
    }).then(results => {
        //Put the images selected from each tag into a single array and shuffle it
        const flattenRes = [].concat.apply([], results);
        return shuffle(flattenRes);
    });
}

//Delete a media from the DB, return a promise
const deleteMedia = (id) => {
    return db.deleteMedia(connection, id);
}

//Upload a media to the DB, return a promise
const uploadMedia = (data) => {
    data.capturetime = convertUTCDateToLocalDate(data.capturetime);
    data.uploadtime = convertUTCDateToLocalDate(data.uploadtime);
    return db.uploadMedia(connection, data, (result) => resolve(result));
}

//Get a promise containing all the info about a media from the DB
const getMediaInfo = (id) => {
    return db.getMediaInfo(connection, id);
}

//Get a promise containing a boolean indicating if the specified media has been liked by the specified user
const isMediaLikedBy = (userId, mediaId) => {
    return db.isMediaAlreadyLikedBy(connection, userId, mediaId);
}

//Like a media from a user, return a promise
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

//Remove the like of a user from a media, return a promise
const unlikeMedia = (userId, mediaId) => {
    return db.unlikeMedia(connection, mediaId, userId);
}

//Like a comment from a user, return a promise
const likeComment = (userId, commentId) => {
    return db.isCommentAlreadyLikedBy(connection, userId, commentId).then((liked) => {
        if (liked) {
            return {err: "Already liked"};
        } else {
            const time = convertUTCDateToLocalDate(new Date());
            return db.likeComment(connection, commentId, userId, time);
        }
    });
}

//Remove like of a user from a comment, return a promise
const unlikeComment = (userId, commentId) => {
    return db.unlikeComment(connection, commentId, userId);
}

//Create a comment to a media by a user at a certain time containing a certain text
const createComment = (text, userID, time, targetMedia) => {
    return db.createComment(connection, text, userID, convertUTCDateToLocalDate(time), targetMedia);
}

//Get a promise containing the user id of the user identified by username
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

//Get a promise containing the user id of the user identified by email
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

//Get a promise containing the computed hash of a password given a salt
const hashPass = (pass, salt) => {
    return bcrypt.hash(pass, salt);
}

//Create a user, return a promise
const createUser = (username, email, pass, profilepicture = null) => {
    //Generate the salt for the hash
    const psalt = bcrypt.genSalt(saltRounds);
    
    //Generate the hash
    const ppass = psalt.then((salt) => {
        return bcrypt.hash(pass, salt);
    });

    //Store the user in the DB
    return Promise.all([psalt, ppass]).then(([salt, hash]) => {
        db.createUser(connection, username, email, hash, salt, LVL_NORMAL, profilepicture);
    });
}

//Get a promise containing the number of comments for a media
const getNumCommentsFromMedia = (mediaID) => {
    return db.getNumCommentsFromMedia(connection, mediaID);
}

//Get a promise containing information on the validity of the username and email chosen, false or error otherwise
const validUserEmailPair = (username, email) => {
    //Ceck if a username exists
    const userExists = getUserId(username).then(() => true).catch((err) => {
        if (err === USR_NOT_FOUND)
            return false;
        throw new Error(err);    
    });
    //Check if an email exists
    const emailExists = getUserIdFromEmail(email).then(() => true).catch((err) => {
        if (err === EMAIL_NOT_FOUND)
            return false;
        throw new Error(err);    
    });
    //Return a promise containing information on whether the username or email are valid or taken
    return Promise.all([userExists, emailExists]).then(([u, e]) => {return {valid: !(u || e), userTaken: u, emailTaken: e};});
}

//Get a promise containing all the comments for a media
const getCommentsFromMedia = (mediaID) => {
    return db.getCommentsFromMedia(connection, mediaID);
}

//Get a promise containing all the comments of a media and information on whether the user has liked them or not
const getCommentsFromMediaForUser = (mediaID, userID) => {
    return db.getCommentsFromMediaForUser(connection, mediaID, userID);
}

//Get a promise containing login information if the credential of the user are correct
const checkUserLogin = (username, pass) => {
    //Get the data about the user from the DB
    const user = new Promise((resolve, reject) => {
        db.getDataFromAttribute(connection, 'UserInfo', 'username', username).then((result) => {
            if (result != null && result.length > 0)   
                resolve(result[0]);
            else 
                reject(USR_NOT_FOUND);
        });
    });
    //Compute the hash of the inserted password with the salt taken from the DB
    const pHash = user.then(user => {
        const salt = user.salt;
        return bcrypt.hash(pass, salt);
    });
    //Check the credentials and return a promise with the result
    return Promise.all([user, pHash]).then(([user, hash]) => {
       if (user.passhash === hash){
            return {username: user.username, type: userType[user.level]};
       } else {
            return {err: WRONG_CREDENTIAL};
       }
    }).catch(err => {if (err === USR_NOT_FOUND) return {err: USR_NOT_FOUND}; else throw(err)});
}

//Execute a search query and return a promise with the search results
const searchMedias = (words, tags, users) => {
    return db.searchMedias(connection, words, tags, users);
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
    unlikeMedia: checkConnect(unlikeMedia),
    likeComment: checkConnect(likeComment),
    unlikeComment: checkConnect(unlikeComment),
    isMediaLikedBy: checkConnect(isMediaLikedBy),
    searchMedias: checkConnect(searchMedias)
};
