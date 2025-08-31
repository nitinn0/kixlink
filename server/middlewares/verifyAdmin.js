const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ error: "Access Denied. No token provided" });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied. Invalid token format!" });
    }
    
    try {
        const decoded = jwt.verify(token, 'my-key');
        if (!decoded.isAdmin) {
            return res.status(403).json({ error: "Access denied. Admins only" });
        }
        req.user = decoded;
        next(); 
    } catch (error) {
        return res.status(403).json({ error: "Invalid token" });
    }
};

module.exports = verifyAdmin;
