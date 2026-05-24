// =============================================================
// File Upload Middleware (Multer)
// Handles PDF file uploads with validation
// =============================================================
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

// Ensure upload directory exists
const uploadDir = path.resolve(env.UPLOAD_PATH);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ---------------------
// Storage Configuration
// ---------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId-timestamp-originalname
    const uniqueName = `${req.user.id}-${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, uniqueName);
  },
});

// ---------------------
// File Filter
// Only allow PDF files
// ---------------------
const fileFilter = (req, file, cb) => {
  // Check MIME type
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed. Please upload a PDF resume.'), false);
  }
};

// ---------------------
// Multer Upload Instance
// ---------------------
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE, // 10MB default
    files: 1, // Only 1 file at a time
  },
});

// ---------------------
// Upload Middleware with Error Handling
// ---------------------
const uploadResume = (req, res, next) => {
  const singleUpload = upload.single('resume');

  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size is ${env.MAX_FILE_SIZE / (1024 * 1024)}MB`,
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      // Custom file filter errors
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // No file uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file',
      });
    }

    next();
  });
};

module.exports = { uploadResume };
