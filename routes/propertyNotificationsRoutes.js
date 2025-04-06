const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// Notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ user: userId })
      .sort({ timestamp: -1 })
      .lean();
    console.log(`Fetched ${notifications.length} notifications for user ${userId}`);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/notifications/:notificationId/read', protect, async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    console.log('Invalid notificationId:', notificationId);
    return res.status(400).json({ message: 'Invalid notification ID' });
  }

  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      console.log('Notification not found or not owned by user:', notificationId);
      return res.status(404).json({ message: 'Notification not found or not yours' });
    }
    console.log(`Notification ${notificationId} marked as read for user ${userId}`);
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;