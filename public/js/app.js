// secrets
const keys = require('./keys');

// firebase
const firebase = require('firebase');
require('firebase/database');
require('firebase/app');
firebase.initializeApp(keys.firebaseConfig);
const db = firebase.database();

// masonry 
require('./_masonry');

// screenshot machine requirements
const screenshotmachine = require('screenshotmachine');
const ssmKey = keys.ssmApi;
const ssmSecretPhrase = keys.ssmSecret; 
const fs = require('fs');

var simulateClick = function (elem) {
	// Create our event (with options)
	var evt = new MouseEvent('click', {
		bubbles: true,
		cancelable: true,
		view: window
	});
	// If cancelled, don't dispatch our event
	var canceled = !elem.dispatchEvent(evt);
};

// add form entries to database
window.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#new-stash').addEventListener('submit', function() {
    event.preventDefault();

    const ssUrl = document.querySelector('#ss-url').value;
    document.querySelector('#ss-url').value = '';

    const ssLabel = document.querySelector('#ss-label').value;
    document.querySelector('#ss-label').value = '';
    
    const tags = document.querySelector('#ss-tags').value;
    const ssTags = tags.split(',');
    document.querySelector('#ss-tags').value = '';

    const ssNotes = document.querySelector('#ss-notes').value;
    document.querySelector('#ss-notes').value = '';

    let today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;

    


    // create screenshot 
    options = {
      url : ssUrl,
      dimension : '1366xfull', 
      device : 'desktop',
      format: 'jpg',
      cacheLimit: '14',
      delay: '200',
      zoom: '100'
    }

    const apiUrl = screenshotmachine.generateScreenshotApiUrl(ssmKey, ssmSecretPhrase, options);
    // var fs = require('fs');
    // var output = 'output.png';
    // screenshotmachine.readScreenshot(apiUrl).pipe(fs.createWriteStream(output).on('close', function() {
    //   console.log('Screenshot saved as ' + output);
    // }));

    const ssRef = db.ref('screenshots');
    ssRef.push({
      url: ssUrl, 
      image: apiUrl,
      label: ssLabel,
      date: today,
      tags: ssTags,
      notes: ssNotes
    });

    const tagsRef = db.ref('tags');
    ssTags.forEach((tag) => {
      tagsRef.push({
        tagName: tag
      });
    });
    const close = document.querySelector('.item-close');
    simulateClick(close);

  });
  getShots();
});

