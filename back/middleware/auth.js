const jwt = require('jsonwebtoken');

const authorize = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send({
            error: true,
            message: 'No token provided!'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                error: true,
                message: 'Failed to authenticate token.'
            });
        }

        req.userId = decoded.id; 
        next(); 
    });
};

module.exports = authorize;
