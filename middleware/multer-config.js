const multer = require('multer');
const path = require('path');

// TELLING TO MULTER WHERE TO STORE THE FILES AND HOW TO CREATE THEIR NAME
const storage = multer.diskStorage({
    // We register the file in the 'images' directory
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    // We get the file name without the extension, then register it with new name with a timestamp and with the ".webp" extension
    filename: (req, file, callback) => {
        const filename = path.parse(file.originalname).name
        const name = filename.split(' ').join('_');
        callback(null, name + Date.now() + '.webp');
    }
});


module.exports = multer({ storage: storage }).single('image');


