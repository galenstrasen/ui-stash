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

const getShots = () => {
  db.ref('screenshots').on('value', function(results) {
    const ssGrid = document.querySelector('#ss-grid');
    const screenshots = [];
    const allShots = results.val(); // Firebase SDK method to get data from API response

    for (let shot in allShots) {
      const ssUrl = allShots[shot].url;
      const ssImg = allShots[shot].image;
      const ssTags = allShots[shot].tags;
      const ssTitle = allShots[shot].title;
      const ssDate = allShots[shot].date;
      const ssNotes = allShots[shot].notes;
      const gridItemElement = document.createElement('a');
      // load form with info as value 
      // if any of the values change, update the data
      // or click "save changes"
      const cardCover = document.createElement('div');
      cardCover.classList.add('card-content');
      const icoList = document.createElement('ul');
      cardCover.appendChild(icoList);
      const editLi = document.createElement('li');
      icoList.appendChild(editLi);
      const editElement = document.createElement('i');
      editLi.appendChild(editElement);
      editElement.classList.add('fa', 'fa-pencil', 'edit');
      

      // Create delete element
      const deleteLi = document.createElement('li');
      icoList.appendChild(deleteLi);
      const deleteElement = document.createElement('i');
      deleteLi.appendChild(deleteElement);
      deleteElement.classList.add('fa', 'fa-trash', 'delete');
      deleteElement.setAttribute('data-toggle', 'modal');
      deleteElement.setAttribute('data-target', '#deleteItem');
      const deleteBtn = document.querySelector('.delete-item');
      

            
      const viewLi = document.createElement('li');
      icoList.appendChild(viewLi);
      const viewElement = document.createElement('i');
      viewLi.appendChild(viewElement);
      viewElement.classList.add('fa', 'fa-eye');
      

      gridItemElement.appendChild(cardCover);
   

      

      gridItemElement.dataset.id = shot;
      gridItemElement.classList.add('grid-item');
      // gridItemElement.setAttribute('data-toggle', 'modal');
      // gridItemElement.setAttribute('data-target', '#itemDetail');
      tagsStr = ssTags.join(' ');
      gridItemElement.setAttribute('data-tags', tagsStr);
      let img = document.createElement('img');
      img.src = ssImg;
      gridItemElement.appendChild(img);

      screenshots.push(gridItemElement);
    }
    while(ssGrid.firstChild) {
      ssGrid.removeChild(ssGrid.firstChild);
    }
    screenshots.forEach((element) => {
      ssGrid.appendChild(element);
    });
  });
};


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

