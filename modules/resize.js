'use strict';
const sharp = require('sharp');

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

module.exports = {
  resize: resize,
};