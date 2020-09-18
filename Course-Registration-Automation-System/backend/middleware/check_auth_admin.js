const jwt = require('jsonwebtoken');

var secret_key = 'secret_admin';

module.exports = (req, res, next) => {
    try{
        var token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, secret_key);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Auth Failed'
        });
    }
};