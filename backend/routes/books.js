const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')

const booksCtrl = require('../controllers/books')


router.post('/', auth, multer, multer.resizeImage, booksCtrl.createBook);
router.get('/:id', booksCtrl.getOneBook);
router.get('/bestrating', booksCtrl.getBestRating)
router.put('/:id', auth, multer, multer.resizeImage, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.get('/', booksCtrl.getAllBooks);


module.exports = router;