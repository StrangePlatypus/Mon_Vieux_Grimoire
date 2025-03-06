const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');


exports.signup = (req, res, next) => {
    // We get the password through hash 10 times to get it encoded
    bcrypt.hash(req.body.password, 10)
        // Then we register it with the email sent by the user in the request
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            // We save the user and tell the user he's account has been created
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};



exports.login = (req, res, next) => {
    // Through the list of all users we search for one with the same email than in the request
    User.findOne({ email: req.body.email })
        .then(user => {
            // If we can't find any user with the same email, we send an error
            if (!user) {
                return res.status(401).json({ message: 'Utilisateur inconnu' });
            }
            // Else we use bcrypt the compare the request password and the registered password for this user
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    // If the password is different, we send an error
                    if (!valid) {
                        return res.status(401).json({ message: 'Mot de passe incorrect' });
                    }
                    // Else we send a status 200 and register a token for the user
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )

                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

