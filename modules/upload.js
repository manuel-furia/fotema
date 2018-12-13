'use strict';
const ExifImage = require('exif').ExifImage;
const sharp = require('sharp');
const model = require('./model');

//Save a resized picture
const resize = (pathToFile, width, newPath) => {
  return sharp(pathToFile)
  .resize(width)
  .toFile(newPath)
};

//Get a javascript Date out of an Exif time string
const parseExifTime = (exifTime) => {
    var str = exifTime.split(" ");
    var dateStr = str[0].replace(':', '-');
    var properDateStr = dateStr + " " + str[1];
    return new Date(properDateStr);
}

//Create a promise containing the data object to pass to the database when there is an upload of a media
const uploadMediaAndGetData = (req, res) => {
    //A user can not upload if they are not logged in
    if (req.user == null){
        return new Promise(() => {throw new Error('User not logged in.')});
    }
    //Details of the media
    const title = req.body.title;
    const tags = req.body.tags.replace('#', '').split(' ');
    const details = req.body.details;
    const user = req.user;

    const path = req.file.path;

    //Resize the picture
    return resize(path, 360, path + "_thumb").then(() => {
        //Fetch the upload time
        let time = new Date(Date.now());    
        //Fetch the capture time from exif
        //If the fetching fails, use the upload time as capture time
        const exifPromise = new Promise(function(resolve, reject) {
          try{
            new ExifImage({ image : path }, function (error, exifData) {
                if (error){
                    console.log('Error: '+error.message); resolve({'time': time});
                } else {
                    try {time = parseExifTime(exifData.exif.CreateDate);} catch(e){console.log("Failed to read time from exif.")}
                    resolve({'time': time});
                }
            });} catch (e) {console.log("Failed to read time from exif."); resolve({'time': time})};
        }).catch(err => {return {'time': time}});
        //Get the user id of the user that is uploading the media
        const userIdPromise = model.getUserId(req.user.username);
        //Return a promise containing the data
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
