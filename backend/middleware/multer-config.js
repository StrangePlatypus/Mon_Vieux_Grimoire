const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');


const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

// TELLING TO MULTER WHERE TO STORE THE FILES AND HOW TO CREATE THEIR NAME
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});


module.exports = multer({ storage: storage }).single('image');

module.exports.resizeImage = (req, res, next) => {
    // We check if the file exist
    if (!req.file) {
        return next();
    }

    const filePath = req.file.path;
    const outputFilePath = path.join('images', `resized_${req.file.filename}`);

    sharp(filePath)
        .resize({ width: 206, height: 260 })
        .toFile(outputFilePath)
        .then(() => {
            // We replace the previous file with the resized one
            fs.unlink(filePath, () => {
                req.file.path = outputFilePath;
                next();
            });
        })
        .catch(err => {
            console.log(err);
            return next();
        });
};