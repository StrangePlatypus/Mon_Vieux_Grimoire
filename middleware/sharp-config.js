const path = require('path');
const sharp = require('sharp');
const fs = require('fs');


module.exports = (req, res, next) => {
    // If we do not get a file, we get to the next controller
    if (!req.file) {
        return next();
    } else {
        // If a file is found, we get the filename (without the extension), and create the webp file path
        const filePath = req.file.path;
        const filename = path.parse(req.file.filename).name
        const outputFilePath = path.join('images', `resized_${filename}.webp`);

        // We get our file through sharp
        sharp(filePath)
            // We change the file format to webp
            .toFormat('webp')
            // Change the file path to the new webp path
            .toFile(outputFilePath)
            .then(() => {
                // We replace the previous file with the resized one in the book data
                fs.unlink(filePath, () => {
                    req.file.path = outputFilePath;
                    next();
                });
            })

            .catch(err => {
                console.log(err);
                return next();
            });
    }
};