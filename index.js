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

app.get('/get/search/:term/:start/:end', upload.single('mediafile'), (req, res, next) => {
  next();
  //TODO: implement the search function
});

app.get('/get/comments/:imageID', (req, res, next) =>{
    if (req.user){
        model.getUserId(req.user.username).then((userId) => {
            return model.getCommentsFromMediaForUser(req.params.imageID, userId);
        }).then((json) => res.json(json)).catch(handleError);
    } else {
        model.getCommentsFromMedia(req.params.imageID).then((json) => res.send(json));
    }
});


app.get('/get/media/:imageID', (req, res, next) =>{
  const data = model.getMediaInfo(req.params.imageID).then((json) => res.send(json));
});

app.get('/get/medialiked/:imageID', (req, res, next) =>{
  if (req.user) {
    model.getUserId(req.user.username).then((userId) => {
        return model.isMediaLikedBy(userId, req.params.imageID);
    }).then(liked => res.json({liked: liked})).catch(err => {res.json({err: err}); console.error(err)});
  } else {
    res.json({liked: false});
  }
});


app.get('/get/loginstate', function(req, res){
  if (req.user) {
    model.getUserId(req.user.username).then((userId) => {
        res.json({username: req.user.username, userid: userId, type: req.user.type});
    }).catch(err => res.json({err: err}));
  } else {
    res.json({anon: 'anon'});
  }
});


app.post('/post/comment', (req, res) =>{
   let userID = req.body.userID;
   let comment = req.body.comment;
   let imageID = req.body.imageID;
   let time = new Date(Date.now());

   model.createComment(comment, userID, time, imageID).then(() =>{
     res.send({});
   }).catch((err) => res.send({}));

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

app.post('/post/like', (req, res) => {
    model.likeMedia(req.body.userId, req.body.mediaId).then(() => {
        res.send({});
    }).catch(err => res.send({}));
});

app.post('/post/unlike', (req, res) => {
    model.unlikeMedia(req.body.userId, req.body.mediaId).then(() => {
        res.send({});
    }).catch(err => res.send({}));
});

app.post('/post/likecomment', (req, res) => {
    model.likeComment(req.body.userId, req.body.commentId).then(() => {
        res.send({});
    }).catch(err => res.send({}));
});

app.post('/post/unlikecomment', (req, res) => {
    model.unlikeComment(req.body.userId, req.body.commentId).then(() => {
        res.send({});
    }).catch(err => res.send({}));
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

//TODO: Remove
app.post('/upload', upload.single('mediafile'), (req, res) => {
  //Create the image data and store in in the db
  uploadMod.uploadMediaAndGetData(req, res).then(data => {model.uploadMedia(data); res.json({})}).catch(err => {res.json({err: err.message}); console.error(err)});
});

app.post('/post/upload', upload.single('mediafile'), (req, res) => {
  //Create the image data and store in in the db
  uploadMod.uploadMediaAndGetData(req, res).then(data => {model.uploadMedia(data); res.json({})}).catch(err => {res.json({err: err.message}); console.error(err)});
});

app.delete('/delete/media/id', (req, res) =>{
  const owner = model.getMediaInfo(req.body.imageID).then((response) => {
    console.log('test');
    return response.user;
  });

  const actor = model.getUserId(req.user.username);
  Promise.all([owner, actor]).then(([ownerid, actorid]) => { model.actorDeleteMedia(actorid, ownerid, req.body.imageID)}).then(() => res.json({}));

});

http.createServer((req, res)=>{
  console.log('creating http server on port: 8000');
  res.writeHead(302, {'Location': 'https://' + req.headers.host + '/node/' + req.url});
  res.end();
}).listen(8000);

https.createServer(options, app).listen(3000);

