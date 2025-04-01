// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

// Get current user details
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username email phone_no');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user details
router.put('/me', protect, async (req, res) => {
  const { username, email, password, phone_no } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (phone_no) user.phone_no = phone_no;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: 'Profile updated', username: user.username, email: user.email, phone_no: user.phone_no });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;