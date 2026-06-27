const app = require('../src/app');
const connectDB = require('../src/config/db');

// Ensure DB is connected for serverless functions
let isConnected = false;

app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error('Failed to connect to database in Vercel Serverless Function');
    }
  }
  next();
});

module.exports = app;
