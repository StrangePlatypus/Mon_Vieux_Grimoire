const express = require('express');
const mongoose = require('mongoose')
const booksRoutes = require('./routes/books')

const app = express();


// CONNEXION TO MONGODB API
mongoose.connect('mongodb+srv://StrangePlatypus:usvqcdl11006@cluster0.soabn.mongodb.net/test?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


// INSTALLED CORS SO THE FRONTEND APP CAN COMMUNICATE WITH THE API   
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/api/stuff', booksRoutes)


module.exports = app;