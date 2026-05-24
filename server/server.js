// =============================================================
// Server Entry Point
// Express.js server with all middleware and routes
// =============================================================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// ---------------------
// Global Middleware
// ---------------------
app.use(helmet()); // Security headers
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter); // Rate limiting

// Logging (only in development)
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------
// API Routes
// ---------------------
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler (must be last)
app.use(errorHandler);

// ---------------------
// Start Server
// ---------------------
const startServer = async () => {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      console.log(`\n🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      console.log(`📡 API: http://localhost:${env.PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
