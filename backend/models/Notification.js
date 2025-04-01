const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['success', 'info'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'propertyType',
    required: false,
  },
  propertyType: {
    type: String,
    enum: ['PGProperty', 'BHKHouse', 'VacationSpot'],
    required: false,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);