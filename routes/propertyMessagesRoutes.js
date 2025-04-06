const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const PGProperty = require('../models/PGProperty');
const BHKHouse = require('../models/BHKHouse');
const VacationSpot = require('../models/VacationSpot');

router.get('/:propertyId/messages', protect, async (req, res) => {
  const { propertyId } = req.params;
  const userId = req.user._id;
  console.log('Fetching messages for propertyId:', propertyId, 'user:', userId);

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    console.log('Invalid propertyId:', propertyId);
    return res.status(400).json({ message: 'Invalid property ID' });
  }

  try {
    const messages = await Message.find({
      propertyId,
      $or: [
        { sender: userId },
        { recipient: userId },
      ],
    })
      .populate('sender', 'username')
      .populate('recipient', 'username')
      .lean();

    console.log('Messages found:', messages);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/chats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Fetching chats for user:', userId);

    const messages = await Message.find({ $or: [{ sender: userId }, { recipient: userId }] })
      .populate('sender', 'username')
      .populate('recipient', 'username')
      .lean();

    const chats = {};

    for (const msg of messages) {
      const otherUserId = msg.sender._id.toString() === userId.toString()
        ? msg.recipient._id.toString()
        : msg.sender._id.toString();
      const otherUsername = msg.sender._id.toString() === userId.toString()
        ? msg.recipient.username
        : msg.sender.username;
      const convoKey = `${msg.propertyId}-${[userId.toString(), otherUserId].sort().join('-')}`;

      let property;
      switch (msg.propertyType) {
        case 'pg':
          property = await PGProperty.findById(msg.propertyId).select('propertyName images');
          break;
        case 'bhk':
          property = await BHKHouse.findById(msg.propertyId).select('propertyName images');
          break;
        case 'vacation':
          property = await VacationSpot.findById(msg.propertyId).select('propertyName images');
          break;
        default:
          console.log(`Unknown propertyType for message ${msg._id}: ${msg.propertyType}`);
          property = null;
      }

      if (!chats[convoKey]) {
        chats[convoKey] = {
          userId: otherUserId,
          username: otherUsername,
          lastMessage: msg.content,
          lastTimestamp: msg.timestamp,
          propertyId: msg.propertyId.toString(),
          propertyName: property?.propertyName || 'Unknown Property',
          imageUrl: property?.images?.[0] || 'https://placehold.co/50',
          propertyType: msg.propertyType,
          unreadCount: 0,
        };
      } else if (new Date(msg.timestamp) > new Date(chats[convoKey].lastTimestamp)) {
        chats[convoKey].lastMessage = msg.content;
        chats[convoKey].lastTimestamp = msg.timestamp;
      }

      if (!msg.isRead && msg.recipient._id.toString() === userId.toString()) {
        chats[convoKey].unreadCount += 1;
      }
    }

    const chatArray = Object.values(chats);
    console.log('Chats fetched:', chatArray);
    res.json(chatArray);
  } catch (error) {
    console.error('Error fetching chats:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/:propertyId/messages/mark-read', protect, async (req, res) => {
  const { propertyId } = req.params;
  const { otherUserId } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(propertyId) || !mongoose.Types.ObjectId.isValid(otherUserId)) {
    return res.status(400).json({ message: 'Invalid property ID or user ID' });
  }

  try {
    const result = await Message.updateMany(
      {
        propertyId,
        sender: otherUserId,
        recipient: userId,
        isRead: false,
      },
      { $set: { isRead: true } }
    );
    console.log(`Marked ${result.modifiedCount} messages as read for user ${userId} from ${otherUserId} on property ${propertyId}`);
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error marking messages as read:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/chats/unread', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const unreadCount = await Message.countDocuments({
      recipient: userId,
      isRead: false,
    });
    console.log(`Total unread messages for user ${userId}: ${unreadCount}`);
    res.json({ totalUnread: unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;