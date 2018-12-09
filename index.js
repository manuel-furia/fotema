'use strict';
require('dotenv').config();

//Change this to a secret key in production
const sessionSecret = 'wjdfuwevaufywuieweuiohfiwuigfTYFTUODytctyFTYctodufeufyuGUYfyu'

const http = require('http');
const https = require('https');
const path = require('path');
const passport = require('passport');
const passportMod = require('./modules/passport');
const bodyParser = require('body-parser');
const session = require('express-session');
const express = require('express');
const multer  = require('multer');
const saltRounds = 10;
const upload = multer({ dest: 'uploads/' });   
const fs = require('fs');
const uploadMod = require('./modules/upload');
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

// tell where the static files are located.
app.use(express.static(__dirname + '/frontend'));


const options ={
  key: sslkey,
  cert: sslcrt,
};

app.use(session({ secret: sessionSecret, resave: true,
  saveUninitialized: true,
  cookie: {secure:true} }));

app.use(passport.initialize());
app.use(passport.session());
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({extend: true}));

//passport initialization
passport.use(passportMod.loginStrategy);
passport.serializeUser(passportMod.serializeUser);
passport.deserializeUser(passportMod.deserializeUser);

const cb = (result, res) => {
  res.send(result);
};


//Anonymous user homepage
app.get('/', (req, res, next) =>{
  res.sendFile('wall.html', { root: __dirname + "/frontend/html/" } );
});

//Logged in user homepage
app.get('/home/', (req, res) =>{
  res.sendFile('wall.html', { root: __dirname + "/frontend/html/" } );
});

app.get('/media/:imageID', (req, res, next) => {
    injectValueAndSendHTML(res, '%$m$%', req.params.imageID, 'clickedmedia.html')
});

app.get('/profile/:userID', (req, res, next) => {
    injectValueAndSendHTML(res, '%$u$%', req.params.userID, 'myfotema.html')
});


//API


app.get('/uploads/:path', (req, res, next) =>{
    res.sendFile(req.params.path, { root: __dirname + "/uploads/" } );
});

app.get('/get/anonwall/:start/:end', (req, res, next) =>{
    const start = req.params.start;
    const end = req.params.end;
    const task = model.getMediasByAnonRelevance(start, end);
    task.then((json) => res.json(json)).catch(handleError );


});


app.get('/get/userwall/:user/:start/:end', (req, res, next) =>{



});

app.get('/get/search/:term/:start/:end', upload.single('mediafile'), (req, res, next) => {
  next();
});

app.get('/get/comments/:imageID', (req, res, next) =>{
  const data = model.getCommentsFromMedia(req.params.imageID).then((json) => res.send(json));
});


app.get('/get/media/:imageID', (req, res, next) =>{
    
  const data = model.getMediaInfo(req.params.imageID).then((json) => res.send(json));

});

app.get('/get/loginstate', function(req, res){
  if (req.user) {
    res.json({username: req.user.username, type: req.user.type});
  } else {
    res.json({anon: 'anon'});
  }
});

app.post('/post/comment', (req, res) =>{
  console.log(req.body.username)
});

app.post('/post/signup',  (req, res) =>{

  let userName = req.body.username;
  let email = req.body.email;
  let password = req.body.password;

  model.validUserEmailPair(userName, email).then(result => {
    if(result.valid){
      //both the username and password are not taken and usable --> return to the users own front-page.
      model.createUser(userName, email, password);
      console.log('success!');
      res.json({user: userName});
    }else if(result.userTaken && !result.emailTaken){
      //the username was taken --> return to the signup page with specific message
      res.json({err: "user taken"});
    }else if(result.emailTaken && !result.userTaken){
      //the email was already taken --> return to the signup page with specific message
      res.json({err: "email taken"});
    }else{
      //both the email and username were already taken, return to the signup page with special message.
      res.json({err: "both user and email taken"});
    }
  }).catch(handleError);

});

app.post('/post/signin', passport.authenticate('local'), (req, res) => {
    console.log(`User ${req.user.username} signin`);
    res.send({user: req.user.username, type: req.user.type});
});

app.post('/post/signout', function(req, res){
  console.log(`User ${req.user.username} signout`);
  req.logout();
  res.redirect('/');
});

app.post('/upload', upload.single('mediafile'), (req, res) => {
  //Create the image data and store in in the db
  uploadMod.uploadMediaAndGetData(req, res).then(data => {model.uploadMedia(data); res.json({})}).catch(err => {res.json({err: err.message}); console.error(err)});
});


http.createServer((req, res)=>{
  console.log('creating http server on port: 8000');
  res.writeHead(302, {'Location': 'https://' + req.headers.host + '/node/' + req.url});
  res.end();
}).listen(8000);

https.createServer(options, app).listen(3000);


//testi kikkeL
