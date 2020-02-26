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
      //const ssTitle = allShots[shot].title;
      const ssDate = allShots[shot].date;
      const ssNotes = allShots[shot].notes;
      const gridItemElement = document.createElement('a');
      
      // Create Card Cover El
      const cardCover = document.createElement('div');
      const icoList = document.createElement('ul');
      cardCover.classList.add('card-content');
      cardCover.appendChild(icoList);

      // Create edit element
      const editLi = document.createElement('li');
      const editElement = document.createElement('i');
      icoList.appendChild(editLi);
      editLi.appendChild(editElement);
      editElement.classList.add('fa', 'fa-pencil', 'edit');
      editElement.setAttribute('data-toggle', 'modal');
      editElement.setAttribute('data-target', '#editItem');
      const editForm = document.querySelector('#edit-screenshot');

      // edit action
      editElement.addEventListener('click', function(event) {
  
        const id = event.target.parentNode.parentNode.parentNode.parentNode.dataset.id;
        editForm.setAttribute('data-item-id', id);
        
        // update form values with values from database
        document.querySelector('#ss-url-edit').value = ssUrl;
        document.querySelector('#ss-tags-edit').value = ssTags.join(', ');
        document.querySelector('#ss-notes-edit').value = ssNotes;
        
        editForm.addEventListener('submit', function(event){
          event.preventDefault();
          const id = event.target.getAttribute('data-item-id');
          const newTags = document.querySelector('#ss-tags-edit').value;
          const editedTags = newTags.split(',').map(function(tag) {
            return tag.trim();
          });
          const editedNotes = document.querySelector('#ss-notes-edit').value;
   
          editShot(id, editedTags, editedNotes);
          const close = document.querySelector('.edit-item-close');
          simulateClick(close);
        });

      });


      // Create delete element
      const deleteLi = document.createElement('li');
      const deleteElement = document.createElement('i');
      icoList.appendChild(deleteLi);
      deleteLi.appendChild(deleteElement);
      deleteElement.classList.add('fa', 'fa-trash', 'delete');
      deleteElement.setAttribute('data-toggle', 'modal');
      deleteElement.setAttribute('data-target', '#deleteItem');

      // button in modal is what we use to delete from database 
      const deleteBtn = document.querySelector('.delete-item');

      // on delete element click, trigger modal 
      deleteElement.addEventListener('click', function(event) {
        if(deleteBtn.getAttribute('data-item-id').length > 0) {
          deleteBtn.removeAttribute('data-item-id');
        }
        
        const id = event.target.parentNode.parentNode.parentNode.parentNode.dataset.id;
        deleteBtn.setAttribute('data-item-id', id);
     
        deleteBtn.addEventListener('click', function(event) {
          const id = event.target.getAttribute('data-item-id');
          deleteShot(id); 
        });  
      });

            
      const viewLi = document.createElement('li');
      const viewElement = document.createElement('button');
      viewElement.setAttribute('data-toggle', 'modal');
      viewElement.setAttribute('data-target', '#itemDetail');
      viewLi.classList.add('main-action');
      icoList.appendChild(viewLi);
      
      viewLi.appendChild(viewElement);
      viewElement.classList.add('btn', 'btn-white');
      viewElement.textContent = 'Details';
      
      viewElement.addEventListener('click', function(e) {
        e.preventDefault();

        const tagsList = document.querySelector('#itemDetailLabel');
        tagsList.textContent = ''; // clear tags list first
        
        const lgImg = document.querySelector('.item-img');
        lgImg.src = ssImg;
        const sourceLink = document.querySelector('.item-source');
        sourceLink.href = ssUrl;
        
        // const title = document.querySelector('.item-title');
        // title.textContent = ssTitle;

        const date = document.querySelector('.date-added');
        date.textContent = ssDate;

        //tagsList.textContent = ssTags;
        ssTags.forEach((tag) => {
          let pill = document.createElement('button');
          pill.classList.add('btn', 'btn-sm', 'btn-outline-info');
          pill.textContent = tag;
          tagsList.appendChild(pill);
        });
        const notesOutput = document.querySelector('.item-description');
        notesOutput.textContent = ssNotes;
      });

      

      gridItemElement.appendChild(cardCover);

      gridItemElement.dataset.id = shot;
      gridItemElement.classList.add('grid-item');
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

const deleteShot = (id) => {
  // find message whose objectId is equal to the id we're searching with
  const shotReference =  db.ref('screenshots').child(id);
  shotReference.remove();
};

const editShot = (id, tags, notes) => {
  const shotReference =  db.ref('screenshots').child(id);
  shotReference.update({
    tags: tags,
    notes: notes
  });
};


const createAction = (parent, classList, modal, target) => {
  let itemLi = document.createElement('li');
  parent.appendChild(itemLi);
  let itemElement = document.createElement('i');
  itemLi.appendChild(itemElement);
  let classes = classList.join(', ');
  itemElement.classList.add(...classList);
  if(modal) {
    itemElement.setAttribute('data-toggle', 'modal');
    itemElement.setAttribute('data-target', target);
  }
}

const getProjects = () => {
  db.ref('projects').on('value', function(results) {
    const projDropdown = document.querySelector('#project-wrap');
    const projSelect = document.querySelector('#ss-projects');
    const projectsDropdown = [];
    const projectsSelect = [];
    const allProjects = results.val(); // Firebase SDK method to get data from API response

    for (let project in allProjects) {
      const projName = allProjects[project].name;
      const projOption = document.createElement('OPTION');
      const projFilter = document.createElement('a');
      
      projFilter.classList.add('dropdown-item');
      projFilter.textContent = projName;
      projOption.setAttribute('value', projName);
      let text = document.createTextNode(projName);
      projOption.appendChild(text);

      projectsDropdown.push(projFilter);
      projectsSelect.push(projOption);

    }
    while(projDropdown.firstChild) {
      projDropdown.removeChild(projDropdown.firstChild);
    }
    while(projSelect.firstChild) {
      projSelect.removeChild(projSelect.firstChild);
    }
    projectsDropdown.forEach((element) => {
      projDropdown.appendChild(element);
    });
    projectsSelect.forEach((element) => {
      projSelect.appendChild(element);
    });
  });
};

const simulateClick = function (elem) {
	// Create our event (with options)
	const evt = new MouseEvent('click', {
		bubbles: true,
		cancelable: true,
		view: window
	});
	// If cancelled, don't dispatch our event
	const canceled = !elem.dispatchEvent(evt);
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
    // convert tags into array & trim whitespace
    const ssTags = tags.split(',').map(function(tag) {
      return tag.trim();
    });
    document.querySelector('#ss-tags').value = '';

    const selectedProjects = document.querySelectorAll('#ss-projects option:checked');
    const projects = [];
    selectedProjects.forEach((project) => {
      projects.push(project.label);
    });
    document.querySelector('#ss-projects').value = '';

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
      //label: ssLabel,
      projects: projects,
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
  document.querySelector('#add-project').addEventListener('submit', function() {
    event.preventDefault();
    const projectName = document.querySelector('#project-name').value;
    document.querySelector('#project-name').value = '';

    const projectRef = db.ref('projects');
    projectRef.push({
      name: projectName
    });

    const close = document.querySelector('.add-project-close');
    simulateClick(close);

  });
  getProjects();
});

