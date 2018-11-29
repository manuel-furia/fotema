'use strict';

console.log("Hello World!");

require('dotenv').config();

const http = require('http');
const https = require('https');
const passport = require('passport');
const passportMod = require('./modules/passport');
//const resizeMod = require('./modules/resize');
const bodyParser = require('body-parser');
const session = require('express-session');
const express = require('express');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const app = express();
const LocalStrategy = require('passport-local').Strategy;
const sslkey = fs.readFileSync('/etc/pki/tls/private/ca.key');
const sslcrt = fs.readFileSync('/etc/pki/tls/certs/ca.crt');
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


/*const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
});*/


app.use(express.static('public'));

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
  res.render('index');
});

app.get('/uploads/:name', (req, res)  =>{
  res.sendFile('uploads/' + req.params.name, { root: __dirname });
});


app.post('/imgupload', upload.single('imagefile'),  (req, res, next) =>{
  const path = req.file.path;
  res.send(`File uploaded in ${path}`);
});

http.createServer((req, res)=>{
  console.log('creating http server on port: 8000');
  res.writeHead(302, {'Location': 'https://' + req.headers.host + '/node/' + req.url});
  res.end();
}).listen(8000);

https.createServer(options, app).listen(3000);