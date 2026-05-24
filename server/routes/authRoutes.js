const router = require('express').Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validateSignup, register);
router.post('/login', authLimiter, validateLogin, login);
router.get('/me', protect, getMe);

module.exports = router;
