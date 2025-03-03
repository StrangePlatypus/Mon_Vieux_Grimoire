const Book = require('../models/book');
const fs = require('fs')

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book)
    delete bookObject._id
    delete bookObject._userId
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.filename}`
    })
    book.save()
        .then(() => { res.status(201).json({ message: 'Book created!' }) })
        .catch(error => { res.status(400).json({ error }) })
};


exports.getOneBook = (req, res, next) => {
    Book.findOne({
        _id: req.params.id
    })
        .then((book) => { res.status(200).json(book) })
        .catch((error) => { res.status(404).json({ error: error }) });
}

exports.modifyBook = (req, res, next) => {
    // Verify if there is already a file for this item
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.filename}`
    } : { ...req.body };


    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message: '403 : Unauthorized request' });
            } else {
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié!' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};


exports.deleteBook = (req, res, next) => {
    // We search for the item we need to delete
    Book.findOne({ _id: req.params.id })
        .then(book => {
            // We check if the user is the one who created the item
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                // We delete the file of the selected item
                fs.unlink(`images/${filename}`, () => {
                    // Then we delete the item itself
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};


exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then((books) => { res.status(200).json(books) })
        .catch((error) => { res.status(400).json({ error: error }) });
}

exports.getBestRating = (req, res, next) => {
    Book.find().sort({ averageRating: -1 }).limit(3)
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(404).json({ error }));
}