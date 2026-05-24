// =============================================================
// JWT Authentication Middleware
// Verifies JWT token and attaches user to request object
// =============================================================
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');

/**
 * Protect routes - require valid JWT token
 * Token should be sent in Authorization header: "Bearer <token>"
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // No token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - no token provided',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, env.JWT_SECRET);

      // Attach user to request (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized - user not found',
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - invalid token',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Generate JWT token for a user
 * @param {string} userId - MongoDB user ID
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE,
  });
};

module.exports = { protect, generateToken };
