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


// add form entries to database
$('#new-stash').submit((e) => {
    e.preventDefault();

    // grab URL input
    const urlInput = $('#ss-url');
    const ssUrl = urlInput.val();
    urlInput.val('');

    // grab tags input
    const tagsInput = $('#ss-tags');
    const ssTags = tagsInput.val();
    tagsInput.val('');

    // grab notes input
    const notesInput = $('#ss-notes');
    const ssNotes = notesInput.val();
    notesInput.val('');

    // create a section called screenshots inside database
    const ssRef = db.ref('screenshots');
    // https://api.apiflash.com/v1/urltoimage?access_key=1e5bed6a223f4f1fa823655142d83ae9&format=jpeg&fresh=true&full_page=true&scroll_page=true&thumbnail_width=1400&url=http%3A%2F%2Fsnakeriverinteriors.com&width=1400
    ssRef.push({
        url: ssUrl, 
        tags: [ssTags],
        notes: ssNotes
    });
});

function createGridItem(url, tags, notes) {
    const ssGrid = document.querySelector('#ss-grid');
}

