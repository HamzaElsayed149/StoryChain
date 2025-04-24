const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',  // Allow all origins in development
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/stories', require('./routes/stories'));
app.use('/api/users', require('./routes/users'));

// Export the Express API
module.exports = app;