# fotema
Image sharing platform (second year university project).


# How to setup

0. Clone the repository inside your server folder.
1. Create a MariaDB database called 'fotema'.
2. Execute the commands from /sql/fotema_with_test_data.sql into the database.
3. Run npm install on your server in the repository folder.
4. Run the server in the root of your server (nodemon or npm start or run the index.js)
If the server is not running in the root (/) url (e.g. apache proxy to a different url), change the value of apiroot in frontend/js/conf.js to the url of your server relative to the root (e.g. "/node/").
5. Go to your ip address using https://... (or https://[apiroot] if not running in root directory, see point 4)
6. Enjoy.

