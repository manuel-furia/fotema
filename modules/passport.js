'use strict';

const LocalStrategy = require('passport-local').Strategy;
const db = require('./database');


  // used in authentication of the user login information. exported to index.js.
  const serializeUser = (user, done)=>{
    console.log('serializing user: ' + user.username);
    done(null, user);
  };

  const deserializeUser = (user, done) =>{
    done(null, user)
  };


  //
  const loginStrategy = (new LocalStrategy(
      (username, password, done) =>{
        console.log('serializing user: ' + username);
        if(username !== 'fotema'|| password !== 'fotema')
        {
          console.log('login failed.' + username + " " + password);
          return done(null, false);
        }else{
          console.log('login successful!');
          return done(null, {username: username});
        }
      }
  ));




module.exports = {
  serializeUser: serializeUser,
  deserializeUser: deserializeUser,
  loginStrategy: loginStrategy,
};
