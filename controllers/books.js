const Book = require('../models/book');
const fs = require('fs')

exports.createBook = (req, res, next) => {
    // We get the new book and turn it into an object
    const bookObject = JSON.parse(req.body.book)
    // We delete  the book id and the userId sended by the front end
    delete bookObject._id
    delete bookObject._userId
    // We create the new book with the authenticated user id and the right file
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.filename}`
    })
    // Then we save it and return a message
    book.save()
        .then(() => { res.status(201).json({ message: 'Book created!' }) })
        .catch(error => { res.status(400).json({ error }) })
};


exports.getOneBook = (req, res, next) => {
    // In all the books we search for the one with the right id
    Book.findOne({
        _id: req.params.id
    })
        // Then we return this book
        .then((book) => { res.status(200).json(book) })
        .catch((error) => { res.status(404).json({ error: error }) });
}

exports.modifyBook = async (req, res, next) => {
    // Verify if there is already a file for this item
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.filename}`
    } : { ...req.body };

    //We delete the fake id sended by the front end
    delete bookObject._userId;

    const book = await Book.findOne({ _id: req.params.id })
    // If the userId isn't the one who created the book, the request is denied
    if (book.userId != req.auth.userId) {
        res.status(403).json({ message: '403 : Unauthorized request' });
    }

    // If a new file is uploaded ...
    if (req.file) {
        // We get the uploaded image name
        const filename = book.imageUrl.split('/images/')[1]
        // If the image had been modified, we delete the old one
        if (filename != req.file.filename) {
            fs.unlink(`images/${filename}`, (err => {
                if (err) console.log(err);
            }))
        }
    }
    // Then we update the book
    Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié!' }))
        .catch(error => res.status(401).json({ error }));
}


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
    // From a list of all the books...
    Book.find()
        // Based on the average rating, in decreasing order
        .sort({ averageRating: -1 })
        // We take the 3 first books
        .limit(3)
        // and return them
        .then((books) => { res.status(200).json(books) })
        .catch((error) => { res.status(404).json({ error }) });
}

exports.createRating = async (req, res, next) => {

    // If the rating is set between 0 and 5
    if (0 <= req.body.rating <= 5) {

        // We set the userId and new rating in a variable
        const rating = { userId: req.body.userId, grade: req.body.rating }

        // We get the book we want the add the rating too, based on it's id
        const book = await Book.findOne({ _id: req.params.id })

        // We get an array of all the user id that have already rated this book
        const newRatings = book.ratings
        const userIdList = newRatings.map(rating => rating.userId)
        // We check if the user as already rated this book
        if (userIdList.includes(req.auth.userId)) {
            res.status(403).json({ message: '403 : Unauthorized request' })
        } else {
            // Adding the new rating to the book's ratings list
            newRatings.push(rating)
            // We get all the ratings back and we calculate the average rating
            const allRatings = newRatings.map(rating => rating.grade)
            // We make an addition of all the rating the divite the result by the number of ratings
            const averageGrades = allRatings.reduce((a, b) => a + b) / allRatings.length

            // Finalle we find our book based on it's id and update it with the new rating list and the new average rating
            const updatedBook = await Book.findByIdAndUpdate(
                req.params.id,
                { ratings: newRatings, averageRating: averageGrades, _id: req.params.id },
                // 'new: true' get the book updated
                { new: true })
            // We return the updated book
            res.status(200).json(updatedBook)
        }
    } else {
        res.status(401).json({ message: 'La note doit être comprise entre 0 et 5' });
    }
}