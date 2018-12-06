'use strict';

const mysql = require('mysql2');


//Function to be executed after a select query has been run
const queryResult = (connection, callback) => (error, result) => {
    if (error) {
        console.log(error);
        if (connection) connection.rollback((err) => {});
    } else
        callback(result);
}

//Execute multiple queries
const multipleQueries = (connection, queries, params, callback) => {
    const next = (queriesLeft, paramsLeft, prevResult) => {
        
        if (queriesLeft.length === 0) {connection.commit(); callback(prevResult)}
        else {
            const currentQuery = queriesLeft[0];
            const currentParams = (paramsLeft != null && paramsLeft[0] != null) ? paramsLeft[0] : [];
            paramsLeft.shift();
            queriesLeft.shift();
            connection.execute(
                currentQuery, currentParams, (err, result) => {
                    if (err) console.log(err)
                    else next(queriesLeft, paramsLeft, prevResult);
                }
            )
        }
    }

    connection.beginTransaction((err) => {
        if (!err) next(queries.split(';').filter(x => x != '').map(x => x + ";"), params, {});
    });
    
}


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
const getDataFromAttribute = (connection, tableName, attribute, value, callback) => {
    connection.execute(
        `SELECT *
         FROM ${tableName}
         WHERE ${tableName}.${attribute} = ?`,
         [value],
         queryResult(connection, callback)
    );
}

//Get the number of likes of a media
const getLikesFromMedia = (connection, id, callback) => {
    connection.execute(
       `SELECT Media.*, COUNT(Media.id) AS likes
FROM Media
LEFT JOIN MediaLike ON Media.id = MediaLike.media
WHERE Media.id = ? ;`,
        [id],
        queryResult(connection, callback)
    );
}

//Get the number of comments of a media
const getCommentsFromMedia = (connection, id, callback) => {
    connection.execute(
        `SELECT Media.*, COUNT(Comment.id) AS comments
FROM Media
LEFT JOIN Comment ON Media.id = Comment.targetMedia
WHERE Media.id = ? ;`,
        [id],
        queryResult(connection, callback));
}

//Get tags from media
const getMediaTags = (connection, id, callback) => {
    connection.execute(
       `SELECT Tag.name AS tags
        FROM Media
        INNER JOIN Tagged ON Media.id = Tagged.mediaid
        INNER JOIN Tag ON Tag.id = Tagged.tagid
        WHERE Media.id = ? ;`,
        [id],
        queryResult(connection, callback));
}

const getNumberOfMediasByTag = (connection, tag, callback) => {
    connection.execute(`
SELECT COUNT(*) AS num
FROM Media
INNER JOIN Tagged ON Tagged.mediaid = Media.id
INNER JOIN Tag ON Tagged.tagid = Tag.id
INNER JOIN MediaType ON MediaType.id = Media.type
WHERE MediaType.name != "thumbnail" && Tag.name = ?;
`, 
    [tag],
    queryResult(conection, callback));
}

const getTaggedMediasOrderedByImpact = (connection, tag, start, limit, callback) => {
    connection.execute(
       `
SELECT L.*, C.comments, (L.likes + C.comments) AS impact
FROM (
    SELECT Media.*, COUNT(MediaLike.media) AS likes
    FROM Media
    INNER JOIN MediaType ON Media.type = MediaType.id
    LEFT JOIN MediaLike ON Media.id = MediaLike.media
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
`, [tag, start, limit],
    queryResult(connection, callback));
}

const getMediasOrderedByImpact = (connection, start, limit, callback) => {
    connection.execute(
       `
SELECT L.*, C.comments, (L.likes + C.comments) AS impact
FROM (
    SELECT Media.*, COUNT(MediaLike.media) AS likes
    FROM Media
    INNER JOIN MediaType ON Media.type = MediaType.id
    LEFT JOIN MediaLike ON Media.id = MediaLike.media
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
`, [start, limit],
    queryResult(connection, callback));
}

const getUserFavouriteMedias = (connection, userid, start, end, callback) => {
    connection.execute(
        `SELECT Media.*, IFNULL(L.likes, 0) AS likes, IFNULL(C.comments, 0) AS comments, IFNULL(L.likes + C.comments, 0) AS impact
FROM Media
LEFT JOIN (
    SELECT Media.*, COUNT(MediaLike.media) AS likes
    FROM Media
    INNER JOIN MediaType ON Media.type = MediaType.id
    LEFT JOIN MediaLike ON Media.id = MediaLike.media
    LEFT JOIN UserInfo ON MediaLike.user = UserInfo.id
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
    [userid, userid, start, end],
    queryResult(connection, callback));
}

const getUserFavouriteTags = (connection, userid, start, end, callback) => {
    connection.execute(
        `SELECT Tag.name AS tag, SUM(IFNULL(L.likes, 0)) AS likes, SUM(IFNULL(C.comments, 0)) AS comments, SUM(IFNULL(L.likes, 0)) + SUM(IFNULL(C.comments, 0)) AS impact
FROM Media
LEFT JOIN (
    SELECT Media.*, COUNT(MediaLike.media) AS likes
    FROM Media
    INNER JOIN MediaType ON Media.type = MediaType.id
    LEFT JOIN MediaLike ON Media.id = MediaLike.media
    LEFT JOIN UserInfo ON MediaLike.user = UserInfo.id
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
    [userid, userid, start, end],
    queryResult(connection, callback));
}

/*
 * DELETE QUERIES
 */
const deleteMedia = (connection, mediaID, callback) => {

    const deleteMediaElem = (id, done) => {
        multipleQueries(connection,
           `DELETE FROM MediaLike WHERE media = ? ;
            DELETE FROM Tagged WHERE mediaid = ? ;
            DELETE FROM CommentLike WHERE comment = (
                SELECT Comment.id 
                FROM Comment 
                INNER JOIN Media ON Media.id = Comment.targetmedia 
                WHERE Comment.targetmedia = ? );
            DELETE FROM Comment WHERE targetmedia = ? ;
            DELETE FROM Media WHERE id = ? ;`,
        [[id], [id], [id], [id], [id]],
        (result) => {if (done) callback(result)});
    }

    const fetchedImage = (imageData) => {
        
        if (imageData != null && imageData.length > 0 && imageData[0].thumbnail != null){
            deleteMediaElem(mediaID, false); //Delete the actual media
            deleteMediaElem(imageData[0].thumbnail, true); //Then delete the thumbnail and finish (done = true)
        } else {
            deleteMediaElem(mediaID, true);
        }
        
    }

    getDataFromAttribute(connection, 'Media', 'id', mediaID, (result) => fetchedImage(result));
        
}

/*
 * INSERT QUERIES
 */

//data contains imagepath, thumbpath, title, description, type, capturetime, uploadtime, userid, tags[]
const uploadMedia = (connection, data, callback) => {


    const next = (error, acc, name, results, from, callback) => {
        if (error) {
            console.log(error);
            connection.rollback((err) => {});
        } else {
            acc[name] = results[from];
            callback(acc);
        }
    }

   const insertMedia = (acc, typeID, thumbID, nextID, nextCallback) => {
        connection.execute(
            `INSERT INTO Media (path, title, description, type, thumbnail, capturetime, uploadtime, user)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [data.imagepath, data.title, data.description, typeID, thumbID, data.capturetime, data.uploadtime, data.userid],
            (error, results) => {
                next(error, acc, nextID, results, 'insertId', nextCallback);
            });
    }

    //Step 6 (final)
    const createdTag = (acc) => {
        connection.execute(
            `INSERT INTO Tagged (mediaid, tagid)
             VALUES (?, ?);`,
            [acc.imageID, acc.tagID],
            queryResult(connection, (result)=>{
                    connection.commit()
            })
        );
    }
    //Step 4
    const insertedImage = (acc) => {
        data.tags.forEach(tag => {
        connection.execute(
            'SELECT id, name FROM Tag WHERE name = ?;',
            [tag],
            (error, results) => { //Step 5
                if (results.length === 0){
                    connection.execute(
                    `INSERT INTO Tag (name)
                         VALUES (?);`,
                    [tag],
                    (error, results) => {
                        next(error, acc, 'tagID', results, 'insertId', createdTag);
                    })
                } else {
                    next(error, acc, 'tagID', results[0], 'id', createdTag);
                }
            })
        })
        
    }

    //Step 3
    const insertedThumbnail = (acc) => {
        insertMedia(acc, acc.typeID, acc.thumbID, 'imageID', insertedImage);
    }

    //Step 2
    const gotType = (acc) => {
        insertMedia(acc, 1, null, 'thumbID', insertedThumbnail);
    }

    //Step 1
    connection.beginTransaction((err) => {
        if (err) connection.rollback(function() {
          console.log(err);
        });
        //First, get the typeid of the type of the media
        getDataFromAttribute(connection, 'MediaType', 'name', data.type, (result, r) => {if (result && result.length > 0) {gotType({'typeID' : result[0].id})}})

    });

}





module.exports={
    connect: connect,
    getDataFromAttribute: getDataFromAttribute,
    getLikesFromMedia: getLikesFromMedia,
    getCommentsFromMedia: getCommentsFromMedia,
    getMediaTags: getMediaTags,
    getNumberOfMediasByTag: getNumberOfMediasByTag,
    getUserFavouriteMedias: getUserFavouriteMedias,
    getUserFavouriteTags: getUserFavouriteTags,
    deleteMedia: deleteMedia,
    uploadMedia: uploadMedia,
    getMediasOrderedByImpact: getMediasOrderedByImpact
    
};


