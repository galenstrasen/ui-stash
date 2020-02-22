// firebase
const firebase = require('firebase');
require('firebase/database');
require('firebase/app');
const keys = require('./keys');
firebase.initializeApp(keys.firebaseConfig);

// grab api key
const apiFlash = keys.apiFlash;

