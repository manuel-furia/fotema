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

//Get the first limit medias ordered by the amount of likes
const getMediasOrderedByLikes = (connection, callback, res, limit) => {
    connection.execute(
        [limit],
        `SELECT Media.*, COUNT(T.liked) AS likes
        FROM Media 
        LEFT JOIN (SELECT Media.id, ActionType.id AS liked
            FROM Media
	        INNER JOIN Target ON Media.id = Target.id
	        LEFT JOIN UserAction ON Target.id = UserAction.target
	        LEFT JOIN ActionType ON UserAction.actiontype = ActionType.id
	        WHERE ActionType.name = "like") AS T
        ON T.id = Media.id
        INNER JOIN MediaType ON Media.type = MediaType.id
        WHERE MediaType.name != "thumbnail"
        GROUP BY Media.id
        ORDER BY likes DESC
        LIMIT ?;`,
        queryResult
    );
}

//Get the number of likes of a media
const getLikesFromMedia = (connection, callback, res, id) => {
    connection.execute(
        [id],
       `SELECT Media.*, COUNT(*) AS likes
        FROM Media
        INNER JOIN Target ON Media.id = Target.id
        INNER JOIN UserAction ON Target.id = UserAction.target
        INNER JOIN ActionType ON UserAction.actiontype = ActionType.id
        WHERE ActionType.name = "like" AND Media.id = ? ;`,
        queryResult
    );
}


//Get the number of comments of a media
const getCommentsFromMedia = (connection, callback, res, id) => {
    connection.execute(
        [id],
       `SELECT Media.*, COUNT(T.comment) AS comments
        FROM Media
        LEFT JOIN (SELECT Media.id, Comment.id AS comment
            FROM Media
            INNER JOIN Target ON Media.id = Target.id
            LEFT JOIN Comment ON Target.id = Comment.target) AS T
        ON Media.id = T.id
        WHERE Media.id = ? ;`,
        queryResult
}




//select query to display image, comments, likes, on front end
const select = (connection, callback, res) => {
    connection.query(
        'SELECT * from images',
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


