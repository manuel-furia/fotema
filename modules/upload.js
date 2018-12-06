const uploadMediaAndGetData(req, res)    
    if (req.user == null){
        res.send('AUTHFAIL');
        return;
    }
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
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

    let exifPromise = new Promise(function(resolve, reject) {
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

   return exifPromise.then((exifData) => {
      return {

        imagepath: path,
        thumbpath: path + "_thumb",
        title: title,
        description: details,
        type: 'image',
        capturetime: exifData.time,
        uploadtime: time,
        userid: 2, //TODO: Fetch the user from the DB
        tags: ['cats','fur','play']};
    });

}

module.exports={
    uploadMediaAndGetData: uploadMediaAndGetData
};
