const db = require('./database')

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

module.exports = {
    getMediasByAnonRelevance: checkConnect(getMediasByAnonRelevance),
    deleteMedia: checkConnect(deleteMedia),
    uploadMedia: checkConnect(uploadMedia),
    getUserId: checkConnect(getUserId)
};
