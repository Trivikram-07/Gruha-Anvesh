const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, required: true },
  propertyType: { type: String, enum: ['pg', 'bhk', 'vacation'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

module.exports = mongoose.model('Message', messageSchema);