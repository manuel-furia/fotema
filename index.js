'use strict';

console.log("Hello World!");

require('dotenv').config()

const express = require('express');
const app = express();
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
//const mysql = require('mysql2');

/*const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
});*/

app.use(express.static('public'));

app.get('/', function (req, res) {
    /*connection.query('select * from employee', (err, results, fields) => {
        if (err) res.send('DB error.');
        res.send(results);
    });*/
    res.send('Hello world');
})

app.get('/uploads/:name', function (req, res) {
    res.sendFile('uploads/' + req.params.name, { root: __dirname });
})


app.post('/imgupload', upload.single('imagefile'), function (req, res, next) {
    var path = req.file.path;
    res.send(`File uploaded in ${path}`);
});

app.listen(3000);
