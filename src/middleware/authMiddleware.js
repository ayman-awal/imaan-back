const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if(!token){
        res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.email = decoded.email;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Token is not valid' });
    }
}

module.exports = { authenticate };