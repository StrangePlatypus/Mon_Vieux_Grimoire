const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');




// TELLING TO MULTER WHERE TO STORE THE FILES AND HOW TO CREATE THEIR NAME
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const filename = path.parse(file.originalname).name
        const name = filename.split(' ').join('_');
        callback(null, name + Date.now() + '.webp');
    }
});


module.exports = multer({ storage: storage }).single('image');


module.exports.sharpImage = (req, res, next) => {
    // We check if the file exist
    if (!req.file) {
        return next();
    }

    const filePath = req.file.path;
    const filename = path.parse(req.file.filename).name
    const outputFilePath = path.join('images', `resized_${filename}.webp`);

    sharp(filePath)
        // We change the file format to webp
        .toFormat('webp')
        .toFile(outputFilePath)
        .then(() => {

            // We replace the previous file with the resized one in the API data
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