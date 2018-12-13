# fotema
Image sharing platform (second year university project).


# How to setup

0. Clone the repository inside your server folder.
1. Create a MariaDB database called 'fotema'.
2. Execute the commands from /sql/fotema_with_test_data.sql into the database.
3. Run npm install on your server in the repository folder (if bcrypt fails to install, try version 2.0.0)
4. Run the server in the root of your server (nodemon or npm start or run the index.js)
If the server is not running in the root (/) url (e.g. apache proxy to a different url), change the value of apiroot in frontend/js/conf.js to the url of your server relative to the root (e.g. "/node/").
5. Go to your ip address using https://... (or https://[apiroot] if not running in root directory, see point 4)
6. Enjoy.
NOTE: The test data in the /sql/fotema_with_test_data.sql does not have image files, so the images will show as missing.

# Dependencies

    bcrypt version 3.0.2, for password hashing (if the build fails, version 2.0.0 is also fine)
    body-parser version 1.18.3 for post request parsing
    dotenv version 6.1.0 for .env file
    exif version 0.6.0 to read the exif tags of images
    express version 4.16.4 as webserver
    express-session version 1.15.6 to handle sessions for login
    multer version 1.4.1 to handle file upload
    mysql2 version 1.6.4 to handle DB connection
    passport version 0.4.0 to handle login
    passport-local version 1.0.0 providing local strategy for passport
    sharp version 0.21.0 to resize images
    start version 5.1.0 to execute the starting script

# API

NOTE: All the api calls can also return {err: 'message'} if there has been a server error.  

Pages:  

- GET /  
Return the homepage  

- GET /home/  
Return the image wall  

- GET /media/:imageID  
Return the page showing info and comments for the image with id :imageID  

- GET /uploads/:path  
Return the uploaded file with name :path  

Data and actions:  

- GET /get/wall/:start/:amount  
Return the JSON data for the pictures to be shown in the main wall
The response is an array of JSON objects with the following fields:  

id  
path	  
title	  
description	  
type	(id of the type of media)  
thumbnail	(id if the thumbnail of this media)  
capturetime  
uploadtime  
user	(id of the user owning this media)  
thumbpath	(path of the thumbnail of this media)  
likes	  
comments	  
impact	(likes + comments)  

- GET /get/media/:imageID
Return the JSON data for the image identified by :imageID. The JSON contains the following fields:

id	  
path	  
title	  
description	  
type   (id of the type of media)   
thumbnail	(id if the thumbnail of this media)  
capturetime	  
uploadtime	  
user	(id of the user owning this media)    
thumbpath	(path of the thumbnail of this media)  
likes	  
comments  
ownername   (name of the user owning this media)

- GET /get/comments/:imageID
Returns an array of JSON object representing the comments of the media identified by :imageID. Each object has the following fields:  
id  
text	  
targetmedia	(id of the media to which this comment is attached)  
user (id of the user that made the comment)  
time	  
username (username of the user that made the comment)   
likes	  

- GET /get/medialiked/:imageID  
Get {liked: true} if the media has been liked, {liked: false} otherwise.

- GET /get/loginstate
Get a JSON object with the following fields if the user has logged in:  
username  
userid  
type (none, normal, mod, admin)  
  
If the user has not logged in, get {anon: 'anon'}

- POST /post/comment  
Create a comment.
The JSON to be passed to the request should have the following fields:  
comment (the text of the comment)  
userID (the id of the issuing user)  
imageID (the id of the image)  
  
- POST /post/signup  
Register a new user.  
The JSON to be passed to the request should have the following fields:  
username  
email  
password  
  
- POST /post/search  
Executes a search between the images.
The JSON to be passed to the request should have the following fields:  
otherTerms (terms to search in the title)  
tags (tags to search for)  
usernames (users to search for)  
   
Returns:  
array of JSON objects structured like in /get/wall/:start/:amount  

- POST /post/like  
Like an image. Input: mediaId, userId


- POST /post/unlike  
Remove the like for an image. Input: mediaId, userId


- POST /post/likecomment  
Like a comment. Input: commentId, userId


- POST /post/unlikecomment  
Remove the like from a coment. Input: commentId, userId


- POST /post/signin
Sign in as a user. Input: username, password  


- POST /post/signout
Sign out.


- POST /post/upload
Upload an image to the server. Input:  
title  
tags (array)  
details  
mediafile (binary file to upload)  
category (NOT IMPLEMENTED, will be image, audio or video)  

- POST /delete/media/id
Delete a media from the DB. Input: imageID  
