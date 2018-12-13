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

//Folder that holds the html files of the website
const htmlFolder = __dirname + "/frontend/html/";

//Handle a generic error by printing it to the terminal
const handleError = (err) => {console.error(err)};

//Send an HTML file to the client replacing a specific pattern with a value
const injectValueAndSendHTML = (res, pattern, value, file) => {
    fs.readFile(htmlFolder + file, 'utf8', (err, html) => {
        if (!err){
            res.send(html.replace(pattern, value));
        } else {
            handleError(err);
        }
    });
}

//Tell where the static files are located.
app.use(express.static(__dirname + '/frontend'));

//SSL key and certificate
const options ={
  key: sslkey,
  cert: sslcrt,
};

//Śet up the session
app.use(session({ secret: sessionSecret, resave: true,
  saveUninitialized: true,
  cookie: {secure:true} }));

//Initialize passport
app.use(passport.initialize());
app.use(passport.session());

//Initialize body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extend: true}));

//Set the login strategy for passport
passport.use(passportMod.loginStrategy);
passport.serializeUser(passportMod.serializeUser);
passport.deserializeUser(passportMod.deserializeUser);

//Send the homepage
app.get('/', (req, res, next) =>{
  res.sendFile('wall.html', { root: __dirname + "/frontend/html/" } );
});

//Send the homepage
app.get('/home/', (req, res) =>{
  res.sendFile('wall.html', { root: __dirname + "/frontend/html/" } );
});

//Send the page that will be shown when a media is clicked
app.get('/media/:imageID', (req, res, next) => {
    injectValueAndSendHTML(res, '%$m$%', req.params.imageID, 'clickedmedia.html')
});

//Send the requested uploaded media
app.get('/uploads/:path', (req, res, next) =>{
    res.sendFile(req.params.path, { root: __dirname + "/uploads/" } );
});

//Send a JSON array containing the requested amount of medias data to be displayed in the home page
//start -> the index of the first media to send
//amount -> the amount of media to send
app.get('/get/wall/:start/:amount', (req, res, next) =>{
    const start = req.params.start;
    const amount = req.params.amount;
    if (req.user){
        model.getUserId(req.user.username).then((userId) => {
            return model.getMediasByUserRelevance(start, amount, userId);
        }).then((json) => res.json(json)).catch(handleError);
    } else {
        model.getMediasByAnonRelevance(start, amount).then((json) => res.json(json)).catch(handleError);
    }
});

//Send a JSON array containing the requested amount of comments 
//start -> the index of the first media to send
//amount -> the amount of media to send
app.get('/get/comments/:imageID', (req, res, next) =>{
    if (req.user){
        model.getUserId(req.user.username).then((userId) => {
            return model.getCommentsFromMediaForUser(req.params.imageID, userId);
        }).then((json) => res.json(json)).catch(handleError);
    } else {
        model.getCommentsFromMedia(req.params.imageID).then((json) => res.send(json));
    }
});

//Send additional info about a specific media
//mediaID -> The id of the media
app.get('/get/media/:imageID', (req, res, next) =>{
  const data = model.getMediaInfo(req.params.imageID).then((json) => res.send(json));
});

//Report if the logged in user has liked a media or not.
//If the user is not logged in, and error will be returned
//mediaID -> The id of the media
app.get('/get/medialiked/:imageID', (req, res, next) =>{
  if (req.user) {
    model.getUserId(req.user.username).then((userId) => {
        return model.isMediaLikedBy(userId, req.params.imageID);
    }).then(liked => res.json({liked: liked})).catch(err => {res.json({err: err}); console.error(err)});
  } else {
    res.json({liked: false});
  }
});

//Return the login state of the user (username, userid and user type) or anon if
//the user is not logged in
//mediaID -> The id of the media
app.get('/get/loginstate', function(req, res){
  if (req.user) {
    model.getUserId(req.user.username).then((userId) => {
        res.json({username: req.user.username, userid: userId, type: req.user.type});
    }).catch(err => res.json({err: err}));
  } else {
    res.json({anon: 'anon'});
  }
});

//Create a comment by a user to a specific image at a certain time
app.post('/post/comment', (req, res) =>{
   let userID = req.body.userID;
   let comment = req.body.comment;
   let imageID = req.body.imageID;
   let time = new Date(Date.now());

   model.createComment(comment, userID, time, imageID).then(() =>{
     res.send({});
   }).catch((err) => res.send({}));

});

//Register a new user
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

//Perform a search of words, tags and/or usernames, and return matching medias
app.post('/post/search', (req, res) => {
  model.searchMedias(req.body.otherTerms, req.body.tags, req.body.usernames).then(json => res.json(json)).catch(handleError);
});

//Add a like to a specific media from the logged in user
app.post('/post/like', (req, res) => {
    model.likeMedia(req.body.userId, req.body.mediaId).then(() => {
        res.send({});
    }).catch(err => res.send({}));
});

//Remove a granted like from a specific media from the logged in user
app.post('/post/unlike', (req, res) => {
    model.unlikeMedia(req.body.userId, req.body.mediaId).then(() => {
        res.send({});
    }).catch(err => res.send({}));
});

//Add a like to a specific comment from the logged in user
app.post('/post/likecomment', (req, res) => {
    model.likeComment(req.body.userId, req.body.commentId).then(() => {
        res.send({});
    }).catch(err => res.send({}));
});

//Remove a granted like from a specific comment from the logged in user
app.post('/post/unlikecomment', (req, res) => {
    model.unlikeComment(req.body.userId, req.body.commentId).then(() => {
        res.send({});
    }).catch(err => res.send({}));
});

//Login a registered user with a username and a password
app.post('/post/signin', passport.authenticate('local'), (req, res) => {
    console.log(`User ${req.user.username} signin`);
    res.send({user: req.user.username, type: req.user.type});
});

//Logout a logged in user
app.post('/post/signout', function(req, res){
  console.log(`User ${req.user.username} signout`);
  req.logout();
  res.redirect('/');
});

//Upload an image the server
app.post('/post/upload', upload.single('mediafile'), (req, res) => {
  //Create the image data and store in in the db
  uploadMod.uploadMediaAndGetData(req, res).then(data => {model.uploadMedia(data); res.json({})}).catch(err => {res.json({err: err.message}); console.error(err)});
});

//Delete image data of an image from the database
app.delete('/delete/media/id', (req, res) =>{
  const owner = model.getMediaInfo(req.body.imageID).then((response) => {
    console.log('test');
    return response.user;
  });

  const actor = model.getUserId(req.user.username);
  Promise.all([owner, actor]).then(([ownerid, actorid]) => { model.actorDeleteMedia(actorid, ownerid, req.body.imageID)}).then(() => res.json({}));

});

//Start the server in http and https, redirecting the http requests to https
http.createServer((req, res)=>{
  console.log('creating http server on port: 8000');
  res.writeHead(302, {'Location': 'https://' + req.headers.host + '/node/' + req.url});
  res.end();
}).listen(8000);

https.createServer(options, app).listen(3000);

