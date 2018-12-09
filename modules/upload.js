'use strict';
const ExifImage = require('exif').ExifImage;
const sharp = require('sharp');
const model = require('./model');

const resize = (pathToFile, width, newPath) => {
  return sharp(pathToFile)
  .resize(width)
  .toFile(newPath)
};

const uploadMediaAndGetData = (req, res) => {
    if (req.user == null){
        return new Promise(() => {throw new Error('User not logged in.')});
    }

    const title = req.body.title;
    const tags = req.body.tags.replace('#', '').split(' ');
    const details = req.body.details;
    const user = req.user;

    const path = req.file.path;

    return resize(path, 360, path + "_thumb").then(() => {

        const now = new Date(Date.now());
        let time = now.toString();    

        const exifPromise = new Promise(function(resolve, reject) {
          try{
            new ExifImage({ image : path }, function (error, exifData) {
                if (error){
                    console.log('Error: '+error.message); resolve({'time': time});
                } else {
                    try {time = exifData.exif.CreateDate;} catch(e){console.log("Failed to read time from exif.")}
                    resolve({'time': time});
                }
            });} catch (e) {console.log("Failed to read time from exif."); resolve({'time': time})};
        }).catch(err => {return {'time': time}});

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

    });
};

module.exports={
    uploadMediaAndGetData: uploadMediaAndGetData
};
