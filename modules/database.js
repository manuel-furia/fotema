'use strict';

const mysql = require('mysql2/promise');

const executePlainQuery = (connection, sql) => {
    return connection.then((con) => con.query(sql)).then(([rows, fields]) => rows);
};

const executeQuery = (connection, sql, params) => {
    return connection.then((con) => con.execute(sql, params)).then(([rows, fields]) => rows);
};

const startTransaction = (connection) => {
    return connection.then((con) => con.query('START TRANSACTION;')).then(([rows, fields]) => rows);
};

const commit = (connection) => {
    return connection.then((con) => con.query('COMMIT')).then(([rows, fields]) => rows);
};

const rollback = (connection) => {
    return connection.then((con) => con.query('ROLLBACK;')).then(([rows, fields]) => rows);
};

//Execute multiple queries
const multipleQueries = (connection, queries, params) => {

    const zipWith = (xs, ys, f) => xs.map((x,i) => f(x, ys[i]));

    const queriesArr = queries.split(';').filter(x => x != '').map(x => x + ";");

    const filledParams = (params.length >= queries.length) ? params : [...params, ...Array(queriesArr.length-params.length).fill([])];

    const runnables = zipWith(queriesArr, filledParams, (query, param) => () => executeQuery(connection, query, param));

    const start = startTransaction(connection);

    const transaction = runnables.reduce((p, fn) => p.then(fn), start);

    return transaction.then(() => commit(connection));
};


const connect = () => {
    return mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASS,
      multipleStatements: true
  });
};

/*
 * GET QUERIES
 */

//Get the content of a table filtered by a value of an attribute
const getDataFromAttribute = (connection, tableName, attribute, value) => {
    return executeQuery(connection,
        `SELECT *
         FROM ${tableName}
         WHERE ${tableName}.${attribute} = ?`,
         [value]
    );
}

//Get the number of likes of a media
const getLikesFromMedia = (connection, id) => {
    return executeQuery(connection,
       `SELECT Media.*, COUNT(Media.id) AS likes
FROM Media
LEFT JOIN MediaLike ON Media.id = MediaLike.media
WHERE Media.id = ? ;`,
        [id]
    );
}

//Get the number of comments of a media
const getNumCommentsFromMedia = (connection, id) => {
    return executeQuery(connection,
        `SELECT Media.*, COUNT(Comment.id) AS comments
FROM Media
LEFT JOIN Comment ON Media.id = Comment.targetMedia
WHERE Media.id = ? ;`,
        [id]);
}

//Get the comments of a media
const getCommentsFromMedia = (connection, mediaID) => {
    return executeQuery(connection,
        `SELECT Comment.*, COUNT(CommentLike.comment) AS likes
FROM Media
INNER JOIN Comment ON Media.id = Comment.targetMedia
LEFT JOIN CommentLike ON Comment.id = CommentLike.comment
WHERE Media.id = ?
GROUP BY Comment.id
ORDER BY time DESC;`,
        [mediaID]);
}

//Get tags from media
const getMediaTags = (connection, id) => {
    return executeQuery(connection,
       `SELECT Tag.name AS tags
        FROM Media
        INNER JOIN Tagged ON Media.id = Tagged.mediaid
        INNER JOIN Tag ON Tag.id = Tagged.tagid
        WHERE Media.id = ? ;`,
        [id]);
}

const getNumberOfMediasByTag = (connection, tag) => {
    return executeQuery(connection,`
SELECT COUNT(*) AS num
FROM Media
INNER JOIN Tagged ON Tagged.mediaid = Media.id
INNER JOIN Tag ON Tagged.tagid = Tag.id
INNER JOIN MediaType ON MediaType.id = Media.type
WHERE MediaType.name != "thumbnail" && Tag.name = ?;
`, 
    [tag]);
}

const getTaggedMediasOrderedByImpact = (connection, tag, start, limit) => {
    return executeQuery(connection,
       `
SELECT L.*, C.comments, (L.likes + C.comments) AS impact
FROM (
    SELECT Media.*, Thumbnails.path AS thumbpath, COUNT(MediaLike.media) AS likes
    FROM Media
    INNER JOIN MediaType ON Media.type = MediaType.id
    LEFT JOIN MediaLike ON Media.id = MediaLike.media
    LEFT JOIN Media AS Thumbnails ON Media.thumbnail = Thumbnails.id
    WHERE MediaType.name <> "thumbnail"
    GROUP BY Media.id
) AS L
INNER JOIN (
    SELECT Media.id, COUNT(Comment.id) AS comments
    FROM Media
    INNER JOIN MediaType ON Media.type = MediaType.id
    LEFT JOIN Comment ON Media.id = Comment.targetMedia
    WHERE MediaType.name <> "thumbnail"
    GROUP BY Media.id
) AS C
ON L.id = C.id
INNER JOIN Tagged ON Tagged.mediaid = L.id
INNER JOIN Tag ON Tagged.tagid = Tag.id
WHERE Tag.name = ?
ORDER BY impact DESC
LIMIT ?, ? ;
`, [tag, start, limit]);
}

const getMediasOrderedByImpact = (connection, start, limit) => {
    return executeQuery(connection,
       `
SELECT L.*, C.comments, (L.likes + C.comments) AS impact
FROM (
    SELECT Media.*, Thumbnails.path AS thumbpath, COUNT(MediaLike.media) AS likes
    FROM Media
    INNER JOIN MediaType ON Media.type = MediaType.id
    LEFT JOIN MediaLike ON Media.id = MediaLike.media
    LEFT JOIN Media AS Thumbnails ON Media.thumbnail = Thumbnails.id
    WHERE MediaType.name <> "thumbnail"
    GROUP BY Media.id
) AS L
INNER JOIN (
    SELECT Media.id, COUNT(Comment.id) AS comments
    FROM Media
    INNER JOIN MediaType ON Media.type = MediaType.id
    LEFT JOIN Comment ON Media.id = Comment.targetMedia
    WHERE MediaType.name <> "thumbnail"
    GROUP BY Media.id
) AS C
ON L.id = C.id
ORDER BY impact DESC
LIMIT ?, ? ;
`, [start, limit]);
}

const getUserFavouriteMedias = (connection, userid, start, end) => {
    return executeQuery(connection,
        `SELECT Media.*, IFNULL(L.likes, 0) AS likes, IFNULL(C.comments, 0) AS comments, IFNULL(L.likes + C.comments, 0) AS impact
FROM Media
LEFT JOIN (
    SELECT Media.*, Thumbnails.path AS thumbpath, COUNT(MediaLike.media) AS likes
    FROM Media
    INNER JOIN MediaType ON Media.type = MediaType.id
    LEFT JOIN MediaLike ON Media.id = MediaLike.media
    LEFT JOIN UserInfo ON MediaLike.user = UserInfo.id
    LEFT JOIN Media AS Thumbnails ON Media.thumbnail = Thumbnails.id
    WHERE UserInfo.id = ?
    GROUP BY Media.id
) AS L ON Media.id = L.id
LEFT JOIN (
    SELECT Media.id, COUNT(Comment.id) AS comments
    FROM Media
    INNER JOIN MediaType ON Media.type = MediaType.id
    LEFT JOIN Comment ON Media.id = Comment.targetMedia
    LEFT JOIN UserInfo ON Comment.user = UserInfo.id
    WHERE UserInfo.id = ?
    GROUP BY Media.id
) AS C ON C.id = Media.id
INNER JOIN MediaType ON MediaType.id = Media.type
WHERE MediaType.name <> "thumbnail"
ORDER BY impact DESC
LIMIT ?, ? ;`,
    [userid, userid, start, end]);
}

const getUserFavouriteTags = (connection, userid, start, end) => {
    return executeQuery(connection,
        `SELECT Tag.name AS tag, SUM(IFNULL(L.likes, 0)) AS likes, SUM(IFNULL(C.comments, 0)) AS comments, SUM(IFNULL(L.likes, 0)) + SUM(IFNULL(C.comments, 0)) AS impact
FROM Media
LEFT JOIN (
    SELECT Media.*, Thumbnails.path AS thumbpath, COUNT(MediaLike.media) AS likes
    FROM Media
    INNER JOIN MediaType ON Media.type = MediaType.id
    LEFT JOIN MediaLike ON Media.id = MediaLike.media
    LEFT JOIN UserInfo ON MediaLike.user = UserInfo.id
    LEFT JOIN Media AS Thumbnails ON Media.thumbnail = Thumbnails.id
    WHERE UserInfo.id = ?
    GROUP BY Media.id
) AS L ON Media.id = L.id
LEFT JOIN (
    SELECT Media.id, COUNT(Comment.id) AS comments
    FROM Media
    INNER JOIN MediaType ON Media.type = MediaType.id
    LEFT JOIN Comment ON Media.id = Comment.targetMedia
    LEFT JOIN UserInfo ON Comment.user = UserInfo.id
    WHERE UserInfo.id = ?
    GROUP BY Media.id
) AS C ON C.id = Media.id
INNER JOIN MediaType ON MediaType.id = Media.type
INNER JOIN Tagged ON Tagged.mediaid = Media.id
INNER JOIN Tag ON Tag.id = Tagged.tagid
WHERE MediaType.name <> "thumbnail"
GROUP BY Tag.name
ORDER BY impact DESC
LIMIT ?, ? ;`,
    [userid, userid, start, end]);
}

const getMediasUploadedByUser = (connection, userID) => {
    return executeQuery
}

/*
 * DELETE QUERIES
 */
const deleteMedia = (connection, mediaID) => {

    const deleteMediaElem = (id, done) => {
        return multipleQueries(connection,
           `DELETE FROM MediaLike WHERE media = ? ;
            DELETE FROM Tagged WHERE mediaid = ? ;
            DELETE FROM CommentLike WHERE comment = (
                SELECT Comment.id 
                FROM Comment 
                INNER JOIN Media ON Media.id = Comment.targetmedia 
                WHERE Comment.targetmedia = ? );
            DELETE FROM Comment WHERE targetmedia = ? ;
            DELETE FROM Media WHERE id = ? ;`,
        [[id], [id], [id], [id], [id]]);
    }

    getDataFromAttribute(connection, 'Media', 'id', mediaID).then((imageData) => {
        if (imageData != null && imageData.length > 0 && imageData[0].thumbnail != null){
            return deleteMediaElem(mediaID, false).then(() => //Delete the actual media
            deleteMediaElem(imageData[0].thumbnail, true)); //Then delete the thumbnail and finish (done = true)
        } else {
            return deleteMediaElem(mediaID, true);
        }
    });    
}

/*
 * INSERT QUERIES
 */

//data contains imagepath, thumbpath, title, description, type, capturetime, uploadtime, userid, tags[]
const uploadMedia = (connection, data) => {

   const insertMedia = (path, typeID, thumbID) => {
        //console.log([data.imagepath, data.title, data.description, typeID, thumbID, data.capturetime, data.uploadtime, data.userid]);
        return executeQuery(connection,
            `INSERT INTO Media (path, title, description, type, thumbnail, capturetime, uploadtime, user)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [path, data.title, data.description, typeID, thumbID, data.capturetime, data.uploadtime, data.userid]);
    }

    const tagMedia = (mediaID, tagID) => {
        return executeQuery(connection,
            `INSERT INTO Tagged (mediaid, tagid)
             VALUES (?, ?);`,
            [mediaID, tagID]
        );
    }

    const insertTags = (mediaID) => {
        return data.tags.map(tag => {
            const tagIDPresent = executeQuery(connection, 'SELECT id, name FROM Tag WHERE name = ?;', [tag]);
            const tagID = tagIDPresent.then((results) => {
                if (results.length === 0){
                    return executeQuery(connection, 'INSERT INTO Tag (name) VALUES (?);', [tag]).then((result) => result.insertId);
                } else {
                    return results[0].id;
                }
            });
            return tagID.then((tagID) => tagMedia(mediaID, tagID));
        });
    }

    //Start the transaction
    const start = startTransaction(connection)
    //Get the typeid of the type of the media
    const getTypeID = start.then(() => getDataFromAttribute(connection, 'MediaType', 'name', data.type)).then((result) => result[0].id);
    //Get the type id of the type 'thumbnail'
    const getThumbTypeID = start.then(() => getDataFromAttribute(connection, 'MediaType', 'name', 'thumbnail')).then((result) => result[0].id);
    //Create the thumbnail    
    const createThumb = getThumbTypeID.then((thumbTypeID) => insertMedia(data.thumbpath, thumbTypeID, null)).then((result) => result.insertId);
    //Create the media    
    const createMedia = Promise.all([getTypeID, createThumb]).then(([typeID, thumbID]) => insertMedia(data.imagepath, typeID, thumbID)).then((result) => result.insertId);
    //Add all the tags to the media
    const addAllTags = createMedia.then((mediaID) => Promise.all(insertTags(mediaID)));
    //Commit the transaction
    const committed = addAllTags.then(() => commit(connection));

    return committed;

}

const createUser = (connection, username, email, passhash, salt, profilepicture = null) => {
    executeQuery(connection,
        'INSERT INTO UserInfo (username, email, passhash, salt, profilepicture) VALUES (?, ?, ?, ?, ?);',
        [username, email, passhash, salt, profilepicture]);
}

const createMessage = (connection, text, userID, time, targetMedia) => {
    executeQuery(connection,
        'INSERT INTO Comment (text, targetmedia, user, time) VALUES (?, ?, ?, ?);',
        [text, targetMedia, userID, time]);
}

const likeMedia = (connection, mediaID, userID, time) => {
    executeQuery(connection,
        'INSERT INTO MediaLike (user, media, time) VALUES (?, ?, ?);',
        [userID, mediaID, time]);
}

const likeComment = (connection, commentID, userID, time) => {
    executeQuery(connection,
        'INSERT INTO CommentLike (user, comment, time) VALUES (?, ?, ?);',
        [userID, commentID, time]);
}


module.exports={
    connect: connect,
    getDataFromAttribute: getDataFromAttribute,
    getLikesFromMedia: getLikesFromMedia,
    getNumCommentsFromMedia: getCommentsFromMedia,
    getMediaTags: getMediaTags,
    getNumberOfMediasByTag: getNumberOfMediasByTag,
    getUserFavouriteMedias: getUserFavouriteMedias,
    getUserFavouriteTags: getUserFavouriteTags,
    deleteMedia: deleteMedia,
    uploadMedia: uploadMedia,
    getMediasOrderedByImpact: getMediasOrderedByImpact,
    createUser: createUser,
    createMessage: createMessage,
    likeMedia: likeMedia,
    likeComment: likeComment,

};


