'use strict';
require('dotenv').config();

const http = require('http');
const https = require('https');
const passport = require('passport');
const passportMod = require('./modules/passport');
const resizeMod = require('./modules/resize');
const bodyParser = require('body-parser');
const session = require('express-session');
const express = require('express');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });   
const fs = require('fs');
const app = express();
const db = require('./modules/database');
const LocalStrategy = require('passport-local').Strategy;
const sslkey = fs.readFileSync('/etc/pki/tls/private/ca.key');
const sslcrt = fs.readFileSync('/etc/pki/tls/certs/ca.crt');

const connection = database.connect();

//const resize = resizeMod.resize;
//const mysql = require('mysql2');

// tell where the static files are located.
app.use(express.static(__dirname + '/view'));


const options ={
  key: sslkey,
  cert: sslcrt,
};

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extend: true}));

//passport initialization
passport.use(passportMod.loginStrategy);
passport.serializeUser(passportMod.serializeUser);
passport.deserializeUser(passportMod.deserializeUser);

app.use(session({
  secret: 'placeholder',
  resave: true,
  saveUninitialized: true,
  cookie: {secure:true},
}));



// - - - gets the login post. starting the authentication process.
app.post('/login',
  passport.authenticate('local', {successRedirect: '/node/', failureRedirect: '/loginfailedpage'})
);

//homepage!
app.get('/', (req, res, next) =>{
    //first we should check if the user is signed in or not, since that is how we present the context.
    //after knowing if the user is signed in or not, we give them the frontpage.
    // --> if signed in user gets modified front page
    // --> if not, then gets the normal frontpage.
  if(req.user){                                         //--> user is signed in, show the custom homepage

  }else{
                                                        //--> user is not logged in, show basic homepage
  }
});


// -  - - - - - - - - - -  F I L E  U P L O A D - - - - - - - - - - -   (requires a database connection)
const cb = (result, res) => {
  //console.log(result);
  res.send(result);
};

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



http.createServer((req, res)=>{
  console.log('creating http server on port: 8000');
  res.writeHead(302, {'Location': 'https://' + req.headers.host + '/node/' + req.url});
  res.end();
}).listen(8000);

https.createServer(options, app).listen(3000);