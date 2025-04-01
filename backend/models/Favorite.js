const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, required: true },
  propertyType: { type: String, enum: ['pg', 'bhk', 'vacation'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Favorite', favoriteSchema);