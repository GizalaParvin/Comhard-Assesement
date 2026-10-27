const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/sections', require('./routes/sections'));
app.use('/api/stats', require('./routes/stats'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Database connection helper
async function connectDatabase() {
  const customUri = process.env.MONGO_URI;
  if (customUri) {
    await mongoose.connect(customUri);
    console.log('Connected to custom MongoDB');
    return;
  }

  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/taskmanager', {
      serverSelectionTimeoutMS: 2000
    });
    console.log('Connected to local MongoDB');
  } catch (err) {
    console.log('Local MongoDB not running. Starting in-memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('In-memory MongoDB ready');
  }
}

const PORT = process.env.PORT || 5000;

async function autoSeedDemo() {
  try {
    const User = require('./models/User');
    const existing = await User.findOne({ email: 'demo@example.com' });
    if (!existing) {
      const demoUser = await User.create({
        name: 'Demo Student',
        email: 'demo@example.com',
        password: 'password123'
      });
      const { seedTasksForUser } = require('./seedData');
      await seedTasksForUser(demoUser._id);
      console.log('Auto-seeded demo account: demo@example.com / password123');
    }
  } catch (err) {
    console.error('Demo auto-seed error:', err.message);
  }
}

connectDatabase().then(async () => {
  await autoSeedDemo();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
});
