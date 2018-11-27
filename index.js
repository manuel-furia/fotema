'use strict';

console.log("Hello World!");

require('dotenv').config();
const http = require('http');
const https = require('https');
const passport = require('passport');
const bodyParser = require('body-parser');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const express = require('express');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const app = express();

const sslkey = fs.readFileSync('/etc/pki/tls/private/ca.key');
const sslcrt = fs.readFileSync('/etc/pki/tls/certs/ca.crt');
const options ={
    key: sslkey,
    cert: sslcrt,
};


app.use(bodyParser.urlencoded({extend: true}));
app.use(passport.initialize());
app.use(passport.session());



//const mysql = require('mysql2');

passport.serializeUser((user, done) =>{
   console.log('serializing user: ' + user.username);
   done(null, user.id);
});

passport.deserializeUser((user, done) =>{
   done(null, user);
});

app.use(session({
  secret: 'placeholder',
  resave: true,
  saveUninitialized: true,
  cookie: {secure:true},
}));

passport.use(new LocalStrategy(
    (username, password, done) =>{
        if(username != process.env.USER || password != process.env.PASS){return done(null, false);}
        return done(null, {username: username});
    }
));

/*const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
});*/

app.use(express.static('public'));

app.post('/login', passport.authenticate('local', {successRedirect: '/fotemahome', failureRedirect: '/login'}));

app.get('/', (req, res) =>{
    /*connection.query('select * from employee', (err, results, fields) => {
        if (err) res.send('DB error.');
        res.send(results);
    });*/
    res.send('Hello world');
})

app.get('/uploads/:name', (req, res)  =>{
    res.sendFile('uploads/' + req.params.name, { root: __dirname });
})


app.post('/imgupload', upload.single('imagefile'),  (req, res, next) =>{
    var path = req.file.path;
    res.send(`File uploaded in ${path}`);
});

const proxy = http.createServer((req, res)=>{
    console.log('creating http server on port: 8000');
    res.writeHead(302, {'Location': 'https://' + req.headers.host + '/node/' + req.url});
    res.end();
}).listen(8000);

https.createServer(options, app).listen(3000);
