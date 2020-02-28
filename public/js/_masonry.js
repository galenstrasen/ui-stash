// Use Masonry JS grid library to control masonry style layout 
// https://masonry.desandro.com/


const Masonry = require('masonry-layout');
require('imagesloaded');
require('isotope-layout');

const masonry = new Masonry( document.querySelector('#ss-grid'), {
      itemSelector: '.grid-item'
});

module.exports = masonry;


