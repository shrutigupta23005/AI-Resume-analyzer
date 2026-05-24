// =============================================================
// Request Validation Middleware
// Uses express-validator to validate and sanitize inputs
// =============================================================
const { body, validationResult } = require('express-validator');

/**
 * Handle validation results
 * Returns 400 with error messages if validation fails
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// ---------------------
// Validation Rules
// ---------------------

/** Validate signup request */
const validateSignup = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters')
    .escape(),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidation,
];

/** Validate login request */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidation,
];

/** Validate job description input */
const validateJobDescription = [
  body('jobDescription')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 50 })
    .withMessage('Job description must be at least 50 characters'),
  handleValidation,
];

module.exports = {
  validateSignup,
  validateLogin,
  validateJobDescription,
  handleValidation,
};
