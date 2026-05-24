// =============================================================
// Database Configuration - MongoDB Connection
// Uses local/Atlas MongoDB, falls back to in-memory server
// =============================================================
const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 * Tries the configured URI first (local or Atlas).
 * If that fails, automatically starts an in-memory MongoDB server
 * so the app works out of the box with zero external setup.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-analyzer';

  try {
    // Try connecting to the configured MongoDB URI
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Fail fast if can't connect
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    setupConnectionHandlers();
    return conn;
  } catch (error) {
    console.warn(`⚠️  Could not connect to MongoDB at ${uri}`);
    console.log('🔄 Starting in-memory MongoDB server...');

    // Fall back to in-memory MongoDB
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();

      const conn = await mongoose.connect(memoryUri);

      console.log(`✅ In-memory MongoDB started successfully`);
      console.log(`⚠️  NOTE: Data will NOT persist after server restart.`);
      console.log(`💡 For persistent data, set MONGODB_URI in server/.env\n`);

      setupConnectionHandlers();

      // Graceful shutdown: stop the in-memory server on exit
      process.on('SIGINT', async () => {
        await mongod.stop();
        process.exit(0);
      });
      process.on('SIGTERM', async () => {
        await mongod.stop();
        process.exit(0);
      });

      return conn;
    } catch (memError) {
      console.error(`\n❌ Failed to start in-memory MongoDB: ${memError.message}`);
      console.error(`\n💡 To fix this, either:`);
      console.error(`   1. Install MongoDB locally: https://www.mongodb.com/try/download/community`);
      console.error(`   2. Use MongoDB Atlas (free): https://www.mongodb.com/atlas`);
      console.error(`      Then update MONGODB_URI in server/.env\n`);
      process.exit(1);
    }
  }
};

/**
 * Set up MongoDB connection event handlers
 */
function setupConnectionHandlers() {
  mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected successfully');
  });
}

module.exports = connectDB;
