require('dotenv').config();
const express = require('express');
const multer  = require('multer');
const sharp  = require('sharp');
const https   = require('https');
const http   = require('http');
const fs = require('fs');
const db = require('./modules/database');
const passport   = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bodyParser = require('body-parser');
const ExifImage = require('exif').ExifImage;
const upload = multer({ dest: 'public/img/' })
const app = express();

const model = require('./modules/model');

//const connection = db.connect();
const rootPrefix = 'public/';

const sslkey  = fs.readFileSync('/etc/pki/tls/private/ca.key');
const sslcert = fs.readFileSync('/etc/pki/tls/certs/ca.crt');
const options = {
  key: sslkey,
  cert: sslcert
};

/*
//data contains imagepath, thumbpath, title, description, type, capturetime, uploadtime, userid, tags[]
const testdata = {
    imagepath: '/test/2',
    thumbpath: '/test/thumb/2',
    title: 'Test 3',
    description: 'Added by node.js',
    type: 'image',
    capturetime: '2018-11-21 00:00:00',
    uploadtime: '2018-11-22 02:00:00',
    userid: 2,
    tags: ['cats','fur','play']
}

model.uploadMedia(testdata);*/

//model.deleteMedia(88);

/*
const p = model.getMediasByAnonRelevance(0, 30);
p.then((res) => console.log(res));
*/


//db.deleteMedia(connection, 86, ()=>{});
/*
db.getUserFavouriteTags(connection, 1, 0, 10, (result, res) => console.log(result));
db.getUserFavouriteTags(connection, 2, 0, 10, (result, res) => console.log(result));
db.getUserFavouriteTags(connection, 3, 0, 10, (result, res) => console.log(result));
db.getUserFavouriteTags(connection, 4, 0, 10, (result, res) => console.log(result));
db.getUserFavouriteTags(connection, 5, 0, 10, (result, res) => console.log(result));*/
