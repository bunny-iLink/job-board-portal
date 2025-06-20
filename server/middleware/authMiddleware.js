import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'Token missing' });

    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const requireRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            console.log(req.user);
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

