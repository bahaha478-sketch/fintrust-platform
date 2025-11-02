const jwt = require('jsonwebtoken');
const users = require('../utils/users');

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = users.findUserById(decoded.id);
      if (!req.user) return res.status(401).json({ message: 'User not found' });
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized' });
    }
  }
  if (!token) return res.status(401).json({ message: 'No token' });
};

module.exports = { protect };
