const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    const customUri = process.env.MONGO_URI;

    if (customUri) {
      console.log(`[DB] Attempting connection to configured MONGO_URI: ${customUri}`);
      await mongoose.connect(customUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[DB] MongoDB Connected Successfully: ${mongoose.connection.host}`);
      return;
    }

    // If no custom URI, attempt connecting to default local MongoDB first
    try {
      console.log('[DB] Checking for local MongoDB service at mongodb://127.0.0.1:27017/taskflow...');
      await mongoose.connect('mongodb://127.0.0.1:27017/taskflow', {
        serverSelectionTimeoutMS: 2000,
      });
      console.log('[DB] Local MongoDB connected successfully!');
      return;
    } catch (localErr) {
      console.log('[DB] Local MongoDB not detected. Starting embedded in-memory MongoDB instance for seamless zero-setup execution...');
    }

    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`[DB] In-Memory MongoDB running at: ${uri}`);
    console.log('[DB] Database is ready for operations.');

    // Auto seed demo data if database is fresh
    const { seedDemoData } = require('../scripts/seedHelper');
    await seedDemoData();
  } catch (error) {
    console.error(`[DB Error] Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error('[DB Error] Error disconnecting database:', err);
  }
};

module.exports = { connectDB, disconnectDB };
