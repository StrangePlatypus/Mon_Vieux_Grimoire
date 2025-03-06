const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // We get the token back from the request headers, without the 'BEARER' part
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        // We get the id from the token
        const userId = decodedToken.userId;
        // Then register this id for our auth routes
        req.auth = {
            userId: userId
        };
        next();
    } catch (error) {
        res.status(401).json({ error });
    }
};
