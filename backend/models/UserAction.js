const mongoose = require('mongoose');

const userActionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, required: true },
  propertyType: { type: String, enum: ['pg', 'bhk', 'vacation'], required: true },
  action: { type: String, enum: ['like', 'click'], required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserAction', userActionSchema);