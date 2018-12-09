'use strict';

const LocalStrategy = require('passport-local').Strategy;
const model = require('./model');

  // used in authentication of the user login information. exported to viewMore.js.
  const serializeUser = (user, done)=>{
    console.log('serializing user: ' + user.username);
    done(null, user);
  };

  const deserializeUser = (user, done) =>{
    done(null, user)
  };


  //
  const loginStrategy = new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
  },
      (username, password, done) => {
        model.checkUserLogin(username, password).then((result) => {
            if(!result.err) {
                console.log('login successful:' + username);
                return done(null, {username: username, type: result.type});
            } else {
                console.log('login failed:' + username);
                return done(null, false);
            }
        }).catch(err => {console.error(err); done(err)});
        
      }
  );




module.exports = {
  serializeUser: serializeUser,
  deserializeUser: deserializeUser,
  loginStrategy: loginStrategy,
};
