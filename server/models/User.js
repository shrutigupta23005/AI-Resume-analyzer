// =============================================================
// User Model
// Handles user accounts with secure password hashing
// =============================================================
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default in queries
    },
    avatar: {
      type: String,
      default: '', // URL to user avatar
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ---------------------
// Pre-save Hook
// Hash password before saving to database
// ---------------------
userSchema.pre('save', async function (next) {
  // Only hash password if it's been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Generate salt with 12 rounds (good balance of security/speed)
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ---------------------
// Instance Method
// Compare entered password with hashed password in DB
// ---------------------
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
