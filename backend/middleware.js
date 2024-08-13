const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config')

const authMiddeware = (req, res, next) => {
    const auth_token = req.headers.authorization;
    
    if(!auth_token || !auth_token.startsWith('Bearer ')) {
        return res.status(403).json({});
    }

    const arr = auth_token.split(' ');
    
    try{
        const verifiedToken = jwt.verify(arr[1], JWT_SECRET);
        
        if(verifiedToken.userId) {
            req.userId = verifiedToken.userId;
            next();
        }
    }catch(err) {
        res.status(403).json({
            msg: 'Invalid auth token'
        });
    }
};

module.exports = {
    authMiddeware
}