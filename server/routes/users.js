const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login or create user
router.post('/login', async (req, res) => {
  try {
    const { nickname } = req.body;
    
    // Find existing user or create new one
    let user = await User.findOne({ nickname });
    
    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({ nickname });
    } else {
      // Update last login time
      user.lastLogin = new Date();
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update nickname
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { nickname } = req.body;
    
    const existingUser = await User.findOne({ nickname });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ message: 'Nickname already taken' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { nickname },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;