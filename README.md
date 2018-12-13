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
