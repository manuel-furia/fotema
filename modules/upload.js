'use strict';
const sharp = require('sharp');
const model = require('./model');

const resize = (pathToFile, width, newPath, next) => {
  sharp(pathToFile)
  .resize(width)
  .toFile(newPath)
  .then(() => {
    console.log('Resize OK');
    next();
  }).catch(err => {
    console.log(err)
  });
};

const uploadMediaAndGetData = (req, res) => {
    if (req.user == null){
        res.json({err: 'Not logged in'});
        return new Promise(() => {throw new Error('User not logged in.')});
    }

    const id = reqbody.id != null ? req.body.id : -1;

    const title = req.body.title;
    const tags = req.body.tags.split(' ').replace('#', '');
    const details = req.body.details;
    const user = req.user;

    console.log(id);

    if (id >= 0){
      const data = [
            category,
            title,
            details,
            id
      ];
      db.update(data, connection, () => {});
      res.send('OK');
      return;
    }

    const path = req.file.path;
    //resize(path, 720, path + "_mid");
    resize(path, 360, path + "_thumb");

    const now = new Date(Date.now());
    let time = now.toString();    

    const exifPromise = new Promise(function(resolve, reject) {
      try{
      new ExifImage({ image : path }, function (error, exifData) {
        if (error){
            console.log('Error: '+error.message); reject('Error: '+error.message)}
        else {
            const now = new Date(Date.now());
            let time = now.toString();
            try {time = exifData.exif.CreateDate;} catch(e){console.log("Failed to read time from exif.")}
            resolve({'time': time});
        }
      });} catch (e) {reject(e.message)};
    });

    const userIdPromise = model.getUserId(req.user.username);

    return Promise.all([userIdPromise, exifPromise]).then(([userId, exifData]) => {
        return {
            imagepath: path,
            thumbpath: path + "_thumb",
            title: title,
            description: details,
            type: 'image',
            capturetime: exifData.time,
            uploadtime: time,
            userid: userId,
            tags: tags
        };
    });
};

module.exports={
    uploadMediaAndGetData: uploadMediaAndGetData
};
