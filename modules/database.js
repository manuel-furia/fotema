'use strict';

const mysql = require('mysql2/promise');

//Transform a javascript date to mysql formatted time string
const getMysqlTime = (jsdatetime) => {
    return jsdatetime.toISOString().slice(0, 19).replace('T', ' ');
}

//Execute a query without external parameters and return a promise with the result
const executePlainQuery = (connection, sql) => {
    return connection.then((con) => con.query(sql)).then(([rows, fields]) => rows);
};

//Execute a query with external parameters and return a promise with the result
const executeQuery = (connection, sql, params) => {
    return connection.then((con) => con.execute(sql, params)).then(([rows, fields]) => rows);
};

//Start a SQL transaction and return a promise
const startTransaction = (connection) => {
    return connection.then((con) => con.query('START TRANSACTION;')).then(([rows, fields]) => rows);
};

//Commit an SQL transaction and return a promise
const commit = (connection) => {
    return connection.then((con) => con.query('COMMIT')).then(([rows, fields]) => rows);
};

//Rollback an SQL transaction and return a promise
const rollback = (connection) => {
    return connection.then((con) => con.query('ROLLBACK;')).then(([rows, fields]) => rows);
};

/*
 * Execute a string composed of multiple queries separated by semicolon
 * The parameters are passed query by query
 * params is an array of parameters (which are also arrays)
 */
const multipleQueries = (connection, queries, params) => {
    //The zipWith function (transform two list into a list by applying a function for each pair of element at a certain index)
    //In pseudocode: result[i] := f(x[i], y[i])
    const zipWith = (xs, ys, f) => xs.map((x,i) => f(x, ys[i]));
    //Get all the queries to execute
    const queriesArr = queries.split(';').filter(x => x != '').map(x => x + ";");
    //Fill the array of params arrays to match the amount of queries
    const filledParams = (params.length >= queries.length) ? params : [...params, ...Array(queriesArr.length-params.length).fill([])];
    //Create runnable lambdas that will execute each query with its parameters
    const runnables = zipWith(queriesArr, filledParams, (query, param) => () => executeQuery(connection, query, param));
    //Create an empty promise to start
    const start = Promise.resolve({});
    //Concatenate all the runnables in one promise chain
    const result = runnables.reduce((p, fn) => p.then(fn), start);
    //Return the promise representing the execution of the queries
    return result;
};

//Connect to the DB
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
        `SELECT Comment.*, UserInfo.username, COUNT(CommentLike.comment) AS likes
FROM Media
INNER JOIN Comment ON Media.id = Comment.targetMedia
INNER JOIN UserInfo ON Comment.user = UserInfo.id
LEFT JOIN CommentLike ON Comment.id = CommentLike.comment
WHERE Media.id = ?
GROUP BY Comment.id
ORDER BY time DESC;`,
        [mediaID]);
};


//Get the comments of a media and mark the ones that the user has already liked
const getCommentsFromMediaForUser = (connection, mediaID, userID) => {
    return getCommentsFromMedia(connection, mediaID).then(comments => markAlreadyLikedBy(connection, userID, comments, isCommentAlreadyLikedBy));
}

//Get tags from media
const getMediaTags = (connection, id) => {
    return executeQuery(connection,
       `SELECT Tag.name AS tag
        FROM Media
        INNER JOIN Tagged ON Media.id = Tagged.mediaid
        INNER JOIN Tag ON Tag.id = Tagged.tagid
        WHERE Media.id = ? ;`,
        [id]);
}

//Get all media info from id
const getMediaInfo = (connection, id) => {
    //Gets all the info that are single objects for each media
    const infoQuery = executeQuery(connection,
       `SELECT L.*, C.comments, UserInfo.username AS ownername
FROM (
    SELECT Media.*, Thumbnails.path AS thumbpath, COUNT(MediaLike.media) AS likes
    FROM Media
    INNER JOIN MediaType ON Media.type = MediaType.id
    LEFT JOIN MediaLike ON Media.id = MediaLike.media
    LEFT JOIN Media AS Thumbnails ON Media.thumbnail = Thumbnails.id
    WHERE MediaType.name <> "thumbnail" AND Media.id = ?
    GROUP BY Media.id
) AS L
INNER JOIN (
    SELECT Media.id, COUNT(Comment.id) AS comments
    FROM Media
    INNER JOIN MediaType ON Media.type = MediaType.id
    LEFT JOIN Comment ON Media.id = Comment.targetMedia
    WHERE MediaType.name <> "thumbnail" AND Media.id = ?
    GROUP BY Media.id
) AS C
ON L.id = C.id
INNER JOIN UserInfo ON UserInfo.id = L.user;`,
        [id, id]);
    //Get the tags separately (as there is a moltitude of them for each media)
    const tagsQuery = getMediaTags(connection, id);
    //Join the two query promises and return a promise containing the resulting data
    return Promise.all([infoQuery, tagsQuery]).then(([info, tags]) => {
        const tagArray = tags.map(tag => tag.tag);
        return Object.assign(info[0], {tags: tagArray});
    });
}

//Get the amount of media that are tagged by tag
const getNumberOfMediasByTag = (connection, tag) => {
    return executeQuery(connection,`
SELECT Tag.name, COUNT(*) AS num
FROM Media
INNER JOIN Tagged ON Tagged.mediaid = Media.id
INNER JOIN Tag ON Tagged.tagid = Tag.id
INNER JOIN MediaType ON MediaType.id = Media.type
WHERE MediaType.name != "thumbnail" && Tag.name = ?;
`, 
    [tag]);
}

//Get the media tagged by tag ordered by decreasing impact (likes + comments)
const getTaggedMediasOrderedByImpact = (connection, tag, start, amount) => {
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
`, [tag, start, amount]);
}

//Get all the medias ordered by decreasing impact (likes + comments)
const getMediasOrderedByImpact = (connection, start, amount) => {
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
`, [start, amount]);
};

//Get a promise of a boolean indicating if a media is already liked by a user
const isMediaAlreadyLikedBy = (connection, userId, mediaId) => {
    return executeQuery(connection, 
        `SELECT MediaLike.*
         FROM Media
         LEFT JOIN MediaLike ON Media.id = MediaLike.media
         LEFT JOIN UserInfo ON MediaLike.user = UserInfo.id
         WHERE UserInfo.id = ? AND Media.id = ?;
        `,
    [userId, mediaId]).then(result => {
            if (result.length > 0)
                return true;
            else
                return false;
     });
}

//Get a promise of a boolean indicating if a comment is already liked by a user
const isCommentAlreadyLikedBy = (connection, userId, commentId) => {
    return executeQuery(connection, 
        `SELECT CommentLike.*
         FROM Comment
         LEFT JOIN CommentLike ON Comment.id = CommentLike.comment
         LEFT JOIN UserInfo ON CommentLike.user = UserInfo.id
         WHERE UserInfo.id = ? AND Comment.id = ?;
        `,
    [userId, commentId]).then(result => {
            if (result.length > 0)
                return true;
            else
                return false;
     });
}

//Mark all the medias already liked by a user by adding a alreadyLiked field in the javascript object
const markAlreadyLikedBy = (connection, userId, results, isAlreadyLikedByFunction) => {
    return Promise.all(results.map(result => {
        return isAlreadyLikedByFunction(connection, userId, result.id).then(liked => {
            if (liked)
                return Object.assign(result, {alreadyLiked: true});
            else
                return result;
        });
    }));
};

//Get the medias ordered by the amount of likes and comments a user has issued on them
const getUserFavouriteMedias = (connection, userid, start, amount) => {
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
    [userid, userid, start, amount]).then(medias => markAlreadyLikedBy(connection, userid, medias, isMediaAlreadyLikedBy));
}

//Get the favourite tags of a user by counting how many images tagged with each tag the user has liked or commented
const getUserFavouriteTags = (connection, userid, start, amount) => {
    return executeQuery(connection,
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
    [userid, userid, start, amount]);
}

//Get all the medias tagged with a specific tag and ordered by decreasing impact (likes + comments)
const getTagMediasOrderedByImpact = (connection, tag, start, amount) => {
    return executeQuery(connection,
       `
SELECT L.*, C.comments, (L.likes + C.comments) AS impact
FROM (
    SELECT Media.*, Thumbnails.path AS thumbpath, COUNT(MediaLike.media) AS likes
    FROM Media
    INNER JOIN MediaType ON Media.type = MediaType.id
    INNER JOIN Tagged ON Tagged.mediaid = Media.id
    INNER JOIN Tag ON Tag.id = Tagged.tagid
    LEFT JOIN MediaLike ON Media.id = MediaLike.media
    LEFT JOIN Media AS Thumbnails ON Media.thumbnail = Thumbnails.id
    WHERE MediaType.name <> "thumbnail" AND Tag.name = ?
    GROUP BY Media.id
) AS L
INNER JOIN (
    SELECT Media.id, COUNT(Comment.id) AS comments
    FROM Media
    INNER JOIN MediaType ON Media.type = MediaType.id
    INNER JOIN Tagged ON Tagged.mediaid = Media.id
    INNER JOIN Tag ON Tag.id = Tagged.tagid
    LEFT JOIN Comment ON Media.id = Comment.targetMedia
    WHERE MediaType.name <> "thumbnail" AND Tag.name = ?
    GROUP BY Media.id
) AS C
ON L.id = C.id
ORDER BY impact DESC
LIMIT ?, ? ;
`, [tag, tag, start, amount]);
};

//Get all the medias tagged with a specific tag and ordered by decreasing impact (likes + comments),
//and mark if the specified user has already liked the or not
const getTagMediasOrderedByImpactForUser = (connection, tag, userid, start, limit) => {
    return getTagMediasOrderedByImpact(connection, tag, start, limit).then(medias => markAlreadyLikedBy(connection, userid, medias, isMediaAlreadyLikedBy));
};

/*
 * DELETE QUERIES
 */

//Delete a media
const deleteMedia = (connection, mediaID) => {
    //Delete an element from the media table, and all its references in other tables
    const deleteMediaElem = (id, done) => {
        return getCommentsFromMedia(connection, mediaID).then((res) => {
            res.forEach(comment => executeQuery(connection, 'DELETE FROM CommentLike WHERE comment = ?', [comment.id]));
            return {};
        }).then(() => {
            return multipleQueries(connection,
               `DELETE FROM MediaLike WHERE media = ? ;
                DELETE FROM Tagged WHERE mediaid = ? ;
                DELETE FROM Comment WHERE targetmedia = ? ;
                DELETE FROM Media WHERE id = ? ;`,
        [[id], [id], [id], [id]]);
        });
    };
    //The SQL transaction that will delete the tables
    return startTransaction(connection).then(() => getDataFromAttribute(connection, 'Media', 'id', mediaID).then((imageData) => {
        if (imageData != null && imageData.length > 0 && imageData[0].thumbnail != null){
            return deleteMediaElem(mediaID, false).then(() => //Delete the actual media
            deleteMediaElem(imageData[0].thumbnail, true)); //Then delete the thumbnail and finish (done = true)
        } else {
            return deleteMediaElem(mediaID, true);
        }
    })).then(() => commit(connection));    
}

/*
 * INSERT QUERIES
 */

//data contains imagepath, thumbpath, title, description, type, capturetime, uploadtime, userid, tags[]
const uploadMedia = (connection, data) => {

   //Insert a media (or thumbnail) in the media table
   const insertMedia = (path, typeID, thumbID) => {
        return executeQuery(connection,
            `INSERT INTO Media (path, title, description, type, thumbnail, capturetime, uploadtime, user)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [path, data.title, data.description, typeID, thumbID, getMysqlTime(data.capturetime), getMysqlTime(data.uploadtime), data.userid]);
    }

    //Connect a media to a single tag (N to N relationship)
    const tagMedia = (mediaID, tagID) => {
        return executeQuery(connection,
            `INSERT INTO Tagged (mediaid, tagid)
             VALUES (?, ?);`,
            [mediaID, tagID]
        );
    }
    
    //Tag the media with all the specified tags (if they don't exist create them)
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

const createUser = (connection, username, email, passhash, salt, level, profilepicture = null) => {
    return executeQuery(connection,
        'INSERT INTO UserInfo (username, email, passhash, salt, level, profilepicture) VALUES (?, ?, ?, ?, ?, ?);',
        [username, email, passhash, salt, level, profilepicture]);
}

const createComment = (connection, text, userID, time, targetMedia) => {
    return executeQuery(connection,
        'INSERT INTO Comment (text, targetmedia, user, time) VALUES (?, ?, ?, ?);',
        [text, targetMedia, userID, getMysqlTime(time)]);
}

const likeMedia = (connection, mediaID, userID, time) => {
    return executeQuery(connection,
        'INSERT INTO MediaLike (user, media, time) VALUES (?, ?, ?);',
        [userID, mediaID, getMysqlTime(time)]);
}

const unlikeMedia = (connection, mediaID, userID) => {
    return executeQuery(connection,
        'DELETE FROM MediaLike WHERE user = ? and media = ?;',
        [userID, mediaID]);
}

const unlikeComment = (connection, commentID, userID) => {
    return executeQuery(connection,
        'DELETE FROM CommentLike WHERE user = ? and comment = ?;',
        [userID, commentID]);
}

const likeComment = (connection, commentID, userID, time) => {
    return executeQuery(connection,
        'INSERT INTO CommentLike (user, comment, time) VALUES (?, ?, ?);',
        [userID, commentID, getMysqlTime(time)]);
}


//Search images by words in title, tags or users
const searchMedias = (connection, words, tags, users) => {
    //Turn a word into a like pattern in SQL
    const toLike = (word) => '%' + word + '%';
    //Insert an appropriate amount of search conditions for words and tags
    const buildSearchWhereWordsTags = (words, tags) => {
        const w = (words.length <= 0) ? '' : ' AND (' + words.map(word => 'Media.title LIKE ?').join(' AND ') + ' )';
        const t = (tags.length <= 0) ? '' : ' AND (' + tags.map(tag => 'Tag.name = ?').join(' OR ') + ' )';

        return w + t;
    }
    //Insert an appropriate amount of search conditions for users
    const buildSearchWhereUsers = (users) => {
        const u = (users.length <= 0) ? '' : 'WHERE ' + users.map(user => 'UserInfo.username = ?').join(' OR ');

        return u;
    }
    //Execute the query with the computed search conditions
    return executeQuery(connection,
       `
SELECT L.*, C.comments, (L.likes + C.comments) AS impact
FROM (
    SELECT Media.*, Thumbnails.path AS thumbpath, COUNT(MediaLike.media) AS likes
    FROM Media
    INNER JOIN MediaType ON Media.type = MediaType.id
    LEFT JOIN Tagged ON Tagged.mediaid = Media.id
    LEFT JOIN Tag ON Tag.id = Tagged.tagid
    LEFT JOIN MediaLike ON Media.id = MediaLike.media
    LEFT JOIN Media AS Thumbnails ON Media.thumbnail = Thumbnails.id
    WHERE MediaType.name <> "thumbnail" ${buildSearchWhereWordsTags(words, tags)}
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
INNER JOIN UserInfo ON UserInfo.id = L.user
${buildSearchWhereUsers(users)}
ORDER BY impact DESC
LIMIT ?, ? ;
`, words.map(toLike).concat(tags).concat(users).concat([0, 12])); //Create the array of parameters to pass to the query, by using words, tags and user arrays
};


module.exports={
    connect: connect,
    getDataFromAttribute: getDataFromAttribute,
    getLikesFromMedia: getLikesFromMedia,
    getNumCommentsFromMedia: getNumCommentsFromMedia,
    getCommentsFromMedia: getCommentsFromMedia,
    getCommentsFromMediaForUser: getCommentsFromMediaForUser,
    getMediaTags: getMediaTags,
    getNumberOfMediasByTag: getNumberOfMediasByTag,
    getUserFavouriteMedias: getUserFavouriteMedias,
    getUserFavouriteTags: getUserFavouriteTags,
    deleteMedia: deleteMedia,
    uploadMedia: uploadMedia,
    getMediasOrderedByImpact: getMediasOrderedByImpact,
    getTagMediasOrderedByImpactForUser: getTagMediasOrderedByImpactForUser,
    createUser: createUser,
    createComment: createComment,
    likeComment: likeComment,
    unlikeComment: unlikeComment,
    getMediaInfo: getMediaInfo,
    isMediaAlreadyLikedBy: isMediaAlreadyLikedBy,
    isCommentAlreadyLikedBy: isCommentAlreadyLikedBy,
    likeMedia: likeMedia,
    unlikeMedia: unlikeMedia,
    searchMedias: searchMedias
};


