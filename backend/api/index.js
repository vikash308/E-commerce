const express = require('express');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');

const serverlessApp = express();

serverlessApp.use(async (req, res, next) => {
  // Check if mongoose is already connected. 
  // 1 = connected, 2 = connecting.
  if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
    try {
      await connectDB();
    } catch (error) {
      console.error('Failed to connect to database in Vercel Serverless Function', error);
    }
  }
  
  // FIX: Vercel automatically strips the "/api" prefix when running functions inside the "api/" folder.
  // Our routes in app.js expect URLs like "/api/products". 
  // This automatically adds "/api" back to the URL if it was stripped.
  if (!req.url.startsWith('/api') && req.url !== '/') {
    req.url = `/api${req.url}`;
  }
  
  next();
});

serverlessApp.use(app);

module.exports = serverlessApp;
