const express = require('express');
const app = require('./src/app');
const connectDB = require('./src/config/db');

// Create a wrapper app to ensure DB connects BEFORE routes are evaluated
const serverlessApp = express();

let isConnected = false;

serverlessApp.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error('Failed to connect to database in Vercel Serverless Function', error);
    }
  }
  next();
});

// Mount the main app which has all the routes like /api/products
serverlessApp.use(app);

module.exports = serverlessApp;
