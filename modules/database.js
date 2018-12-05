'use strict';

const mysql = require('mysql2');

//Function to be executed after a query has been run
const queryResult = (error, result) => {
    if (error)
        console.log(error);
    else
        callback(results, res);
}


const connect = () =>{
    return mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASS
  });
};

/*
 * GET QUERIES
 */

//Get the content of a table filtered by a value of an attribute
const getDataFromAttribute = (connection, callback, res, tableName, attribute, value) => {
    connection.execute(
        [value],
        `SELECT *
         FROM ${tableName}
         WHERE ${tableName}.${attribute} = ?`,
        queryResult
    );
}

//Get the number of likes of a media
const getLikesFromMedia = (connection, callback, res, id) => {
    connection.execute(
        [id],
       `SELECT Media.*, COUNT(Media.id) AS likes
FROM Media
LEFT JOIN MediaLike ON Media.id = MediaLike.media
WHERE Media.id = ? ;`,
        queryResult
    );
}

//Get the number of comments of a media
const getCommentsFromMedia = (connection, callback, res, id) => {
    connection.execute(
        [id],
       `SELECT Media.*, COUNT(Comment.id) AS comments
FROM Media
LEFT JOIN Comment ON Media.id = Comment.targetMedia
WHERE Media.id = ? ;`,
        queryResult);
}

//Get tags from media
const getMediaTags = (connection, callback, res, id) => {
    connection.execute(
        [id],
       `SELECT Tag.name AS tags
        FROM Media
        INNER JOIN Tagged ON Media.id = Tagged.mediaid
        INNER JOIN Tag ON Tag.id = Tagged.tagid
        WHERE Media.id = ? ;`,
        queryResult);
}


const getMediasOrderedByImpact = (connection, callback, res, start, limit) => {
    connection.execute(
        [start, limit],
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
`,
    queryResult);
}

const getUserFavouriteMedias = (connection, callback, res, userid, start, end) => {
    connection.execute(
        [userid, userid, start, end],
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
    queryResult);
}

const getUserFavouriteTags = (connection, callback, res, userid, start, end) => {
    connection.execute(
        [userid, userid, start, end],
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
ORDER BY impact DESC;`,
    queryResult);
}


/*
 * INSERT QUERIES
 */
/*
//data contains imagepath, thumbpath, title, description, type, capturetime, uploadtime, userid, tags[]
const uploadMedia = (connection, callback, res, data) => {

    //Insert the thumbnail
    connection.execute(
        [data.thumbpath, data.title
    

    //First check that the tags exists
    data.tags.forEach(tag => {
        connection.execute(
            [data.tag],
            `INSERT INTO tag (fund_id, date, price)
                VALUES (23, '2013-02-12', 22.43)
                WHERE NOT EXISTS (
                SELECT * 
                FROM funds 
                WHERE fund_id = 23
                AND date = '2013-02-12'
            );`
        );
    }
}*/


//TODO: Remove old select and insert

//select query to display image, comments, likes, on front end
const select = (connection, callback, res) => {
  console.log("teest");
    connection.query(
        'SELECT * from Media',
        (error, results) =>{
            if (error)console.log(error);
            callback(results, res);
        });
};

//insert data into table image, to be modified later 
const insert = (data, connection, callback) => {
    // simple query
    connection.execute(
        'INSERT INTO images (category, title, tags, details,  thumbnail, image, original) VALUES (?, ?, ?, ?, ?, ?, ?)',
        data,
        (err, results, fields) => {
            if (err) {
                console.log(err);
            }
            callback();
        },
    );
};




module.exports={
    connect: connect,
    select: select,
    insert: insert,
};


