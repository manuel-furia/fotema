'use strict';
require('dotenv').config();

const http = require('http');
const https = require('https');
const path = require('path');
const passport = require('passport');
const passportMod = require('./modules/passport');
const resizeMod = require('./modules/resize');
const bodyParser = require('body-parser');
const session = require('express-session');
const express = require('express');
const multer  = require('multer');
const saltRounds = 10;
const upload = multer({ dest: 'uploads/' });   
const fs = require('fs');
const app = express();
const LocalStrategy = require('passport-local').Strategy;
const sslkey = fs.readFileSync('/etc/pki/tls/private/ca.key');
const sslcrt = fs.readFileSync('/etc/pki/tls/certs/ca.crt');

const model = require('./modules/model');

const htmlFolder = __dirname + "/frontend/html/";


const handleError = (err) =>{console.error(err)};

const injectValueAndSendHTML = (res, pattern, value, file) => {
    fs.readFile(htmlFolder + file, 'utf8', (err, html) => {
        if (!err){
            res.send(html.replace(pattern, value));
        } else {
            handleError(err);
        }
    });
}

//const resize = resizeMod.resize;
//const mysql = require('mysql2');

// tell where the static files are located.
app.use(express.static(__dirname + '/frontend'));


const options ={
  key: sslkey,
  cert: sslcrt,
};

app.use(passport.initialize());
app.use(passport.session());
app.use( bodyParser.json() );
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

const cb = (result, res) => {
  res.send(result);
};


//homepage!
app.get('/', (req, res, next) =>{
  /* res.writeHead(302, {'Location':'https://' + req.headers.host + '/node/anonwall/:start/:end'});
   console.log('testi!');
   res.end();*/
  res.sendFile('anonwall.html', { root: __dirname + "/frontend/html/" } );

});

// - - - gets the login post. starting the authentication process.
app.post('/login',
  passport.authenticate('local', {successRedirect: '/node/', failureRedirect: '/loginfailedpage'})
);

app.post('/signup',  (req, res, next) =>{

  //TODO: query to check if the username and email already exist in the database

  let userName = req.body.username;
  let email = req.body.email;
  let password = req.body.password;

  model.validUserEmailPair(userName, email).then(result => {
    if(result.valid){
      //both the username and password are not taken and usable --> return to the users own front-page.
      console.log('testbooi');
      //TODO: add a query to insert the data into the database
      res.redirect('/node/' + userName + '/:start/:end')
    }else if(result.userTaken){
      //the username was taken --> return to the signup page with specific message
      res.writeHead(200, {
        'Message': 'The username was taken, please use another one.'});
      res.send();
    }else if(result.emailTaken){
      //the email was already taken --> return to the signup page with specific message
      res.writeHead(200, {
        'Message': 'The email was taken, please use another one.'});
      res.send();
    }else{
      //both the email and username were already taken, return to the signup page with special message.
      res.writeHead(200, {
        'Message': 'The email and username were taken, please use another ones.'});
      res.send();
    }
  }).catch(handleError);

});


app.post('/signin', passport.authenticate('local'), (req, res) =>{

  //IF the login is succesful
  res.redirect('/node/'+ req.body.username + '/:start/:end')

  //somebody is trying to sign in. we need to do the login check.
  //TODO: Insert query to the database to check the userdata

  //QUERY

});


app.get('/media/:imageID', (req, res, next) => {
    injectValueAndSendHTML(res, '%$m$%', req.params.imageID, 'clickedmedia.html')
});

app.get('/profile/:userID', (req, res, next) => {
    injectValueAndSendHTML(res, '%$u$%', req.params.userID, 'myfotema.html')
});



//API

app.get('/get/anonwall/:start/:end', (req, res, next) =>{
    const start = req.params.start;
    const end = req.params.end;
    const task = model.getMediasByAnonRelevance(start, end);
    task.then((json) => res.send(json)).catch(handleError );
});

app.get('/get/userwall/:user/:start/:end', (req, res, next) =>{


});

app.get('/get/search/:term/:start/:end', upload.single('mediafile'), (req, res, next) => {
  next();
});

app.get('/get/comments/:imageID', (req, res, next) =>{

});

app.get('/get/media/:imageID', (req, res, next) =>{

});

// -  - - - - - - - - - -  F I L E  U P L O A D - - - - - - - - - - -   (requires a database connection)


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


//testi kikkeL
