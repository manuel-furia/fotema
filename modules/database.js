'use strict';

const mysql = require('mysql2');

const connect = () =>{
    return mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASS
  });
};


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


