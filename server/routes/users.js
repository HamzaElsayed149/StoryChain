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

// Update user (nickname or bio)
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { nickname, bio } = req.body;
    
    // If nickname is being updated, check for duplicates
    if (nickname) {
      const existingUser = await User.findOne({ nickname });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({ message: 'Nickname already taken' });
      }
    }
    
    const updateData = {};
    if (nickname) updateData.nickname = nickname;
    if (bio !== undefined) updateData.bio = bio;
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
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

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { bio } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { bio },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Get user by nickname
router.get('/by-nickname/:nickname', async (req, res) => {
  try {
    const { nickname } = req.params;
    const user = await User.findOne({ nickname });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;