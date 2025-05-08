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

// Start server when running locally
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    try {
      console.log(`Server is running on port ${PORT}`);
    } catch (error) {
      console.log(error);
    }
  });
}

// Export for Vercel
module.exports = app;