const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')
const sharp = require('../middleware/sharp-config')

const booksCtrl = require('../controllers/books')


router.post('/', auth, multer, sharp, booksCtrl.createBook);
router.get('/bestrating', booksCtrl.getBestRating)
router.post('/:id/rating', auth, booksCtrl.createRating)
router.get('/:id', booksCtrl.getOneBook);
router.put('/:id', auth, multer, sharp, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.get('/', booksCtrl.getAllBooks);


module.exports = router;