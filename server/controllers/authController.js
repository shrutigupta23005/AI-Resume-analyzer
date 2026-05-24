// =============================================================
// Auth Controller - Handles user registration, login, profile
// =============================================================
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }
    // Create user (password hashed by pre-save hook)
    const user = await User.create({ name, email, password });
    // Generate JWT token
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, createdAt: user.createdAt }, token },
    });
  } catch (error) { next(error); }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Login successful',
      data: { user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, createdAt: user.createdAt }, token },
    });
  } catch (error) { next(error); }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: { user } });
  } catch (error) { next(error); }
};
