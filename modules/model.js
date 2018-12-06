const db = require('database')

const getMediasByAnonRelevance = (connection, start, limit) => {
    return new Promise((resolve, reject) => {
        getMediasOrderedByImpact(connection, start, limit, {result} => resolve(result))
    };
}

const deleteMedia = (connection, id) => {
    return new Promise((resolve, reject) => {
        getMediasOrderedByImpact(connection, start, limit, {result} => resolve(result))
    };
}
