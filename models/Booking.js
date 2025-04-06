// const mongoose = require('mongoose');

// const bookingSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   propertyId: { type: mongoose.Schema.Types.ObjectId, required: true },
//   propertyType: { type: String, enum: ['pg', 'bhk', 'vacation'], required: true },
//   bookingDate: { type: Date, default: Date.now },
//   startDate: { 
//     type: Date, 
//     required: function() { return this.propertyType === 'vacation'; }
//   },
//   endDate: { 
//     type: Date, 
//     required: function() { return this.propertyType === 'vacation'; }
//   },
// }, { timestamps: true });

// module.exports = mongoose.model('Booking', bookingSchema);


// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, required: true },
  propertyType: { type: String, enum: ['pg', 'bhk', 'vacation'], required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);