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
                // We get the uploaded image name
                const filename = book.imageUrl.split('/images/')[1]
                console.log(filename)
                // If the image had been modified, we delete the old one
                if (filename != req.file.filename) {
                    fs.unlink(`images/${filename}`, (err => {
                        if (err) console.log(err);
                    }))
                }

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
    // From a list of all the books we get the 3 best rated and we display them in decreasing order
    Book.find()
        .sort({ averageRating: -1 })
        .limit(3)
        .then((books) => { res.status(200).json(books) })
        .catch((error) => { res.status(404).json({ error }) });
}

exports.createRating = (req, res, next) => {

    // If the rating is set between 0 and 5
    if (0 <= req.body.rating <= 5) {

        const rating = { ...req.body, grade: req.body.rating }
        delete rating._id

        // We get the book we want the add the rating too
        Book.findOne({ _id: req.params.id })
            .then(book => {
                // We get an array of all the user id that have already rated this book
                const newRatings = book.ratings
                const userIdList = newRatings.map(rating => rating.userId)
                // We check if the user as already rated this book
                if (userIdList.includes(req.auth.userId)) {
                    res.status(403).json({ message: '403 : Unauthorized request' })
                } else {
                    // Adding the new rating
                    newRatings.push(rating)
                    // We get back all the ratings back and we calculate the average rating
                    const allRatings = newRatings.map(rating => rating.grade)
                    const averageGrades = average.average(allRatings)

                    Book.updateOne({ _id: req.params.id }, { ratings: newRatings, averageRating: averageGrades, _id: req.params.id })
                        .then(() => { res.status(201).json() })
                        .catch(error => { res.status(400).json({ error }) })
                    res.status(200).json(book)
                }
            })
            .catch((error) => {
                res.status(400).json({ error })
            });
    } else {
        res.status(401).json({ message: 'La note doit être comprise entre 0 et 5' });
    }
}