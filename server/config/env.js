// =============================================================
// Environment Configuration
// Centralizes all environment variable access
// =============================================================

require('dotenv').config();

const env = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-analyzer',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'default-dev-secret-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',

  // Gemini AI
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',

  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
};

module.exports = env;
