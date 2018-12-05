'use strict';
require('dotenv').config();
const express = require('express');
const db = require('./modules/database');
const connection = db.connect();
const resize = require('./modules/resize');
const exif = require('./modules/exif');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const multer = require('multer');
const upload = multer({dest: 'public/uploads/'});   //destination to save uploaded data to
const app = express();

app.use(bodyParser.json());


//serving static file, to be modified
app.use(express.static('public'));  
app.use('/', express.static(__dirname + '/public/html'));
app.use(express.static(__dirname + '/public/'));
//app.use(express.static('public/view'));

const cb = (result, res) => {
    //console.log(result);
    res.send(result);
};


//render index page onload, to be modified according to user data
app.get('/', function(req, res){
    res.render('public/html/anonwall.html');
});



//search
app.get('/search/:value', (req, res)=>{
    //const searchText = req.query.search;
    const value = req.params.value.slice(1);
    console.log('searchText: ' + value);
    
        db.search(value, connection, cb, res);
   
});




// respond to post and save file
app.post('/upload', upload.single('mediafile'), (req, res, next) => {
    next();
});


// create thumbnail
app.use('/upload', (req, res, next) => {
    resize.resize(req.file.path, 300,
        './public/thumbs/' + req.file.filename + '_thumb', next);    //destination path/directory to be created/modified
});

// create medium image
app.use('/upload', (req, res, next) => {
    resize.resize(req.file.path, 640,
        './public/medium/' + req.file.filename + '_medium', next); //destination path/directory created/modified
});


// insert to database
app.use('/upload', (req, res, next) => {
    console.log('insert is here');
    const data = [
        req.body.category,
        req.body.title,
        req.body.tags,
        req.body.details,
        req.file.filename + '_thumb',
        req.file.filename + '_medium',
        req.file.filename,
    ];
    console.log('category:' + req.body.category);
    console.log('title:' + req.body.title);
    console.log('tags:' + req.body.tags);
    console.log('details:' + req.body.details);
    console.log('filename thumb:' + req.file.filename + '_thumb');
    console.log('filename medium:' + req.file.filename + '_medium');
    console.log('filename:' + req.file.filename);

    db.insert(data, connection, next);
});

// get updated data form database and send to client
app.use('/upload', (req, res) => {
    console.log('upload middleware: select' );
    db.select(connection, cb, res);
});

app.get('/images', (req, res) => {
    db.select(connection, cb, res);
});


app.listen(3000);