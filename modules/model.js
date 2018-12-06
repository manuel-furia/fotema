const db = require('./database')

let connection = null

const checkConnect = () => {
    if (connection === null || connection.status === 'disconnected'){
        connection = db.connect();
    }
}

const getMediasByAnonRelevance = (start, limit) => {
    checkConnect();
    return new Promise((resolve, reject) => {
        db.getMediasOrderedByImpact(connection, start, limit, (result) => resolve(result));
    });
}

const deleteMedia = (id) => {
    checkConnect();
    return new Promise((resolve, reject) => {
        db.deleteMedia(connection, id, (result) => resolve(result));
    });
}

const uploadMedia = (data) => {
    checkConnect();
    return new Promise((resolve, reject) => {
        db.uploadMedia(connection, data, (result) => resolve(result));
    });

}

module.exports = {
    getMediasByAnonRelevance: getMediasByAnonRelevance,
    deleteMedia: deleteMedia,
    uploadMedia: uploadMedia
};
