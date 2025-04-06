const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewPrompted: { type: Boolean, default: false },
  numGuests: { type: Number, required: true, min: 1 },
  createdAt: { type: Date, default: Date.now },
});

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String },
  date: { type: Date, default: Date.now },
});

const vacationSpotSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  ratePerDay: { type: Number, required: true },
  maxGuests: { type: Number, required: true },
  description: { type: String, required: true },
  amenities: {
    beachAccess: { type: Boolean, default: false },
    highSpeedWifi: { type: Boolean, default: false },
    parkingSpace: { type: Boolean, default: false },
    airConditioning: { type: Boolean, default: false },
    kingSizeBed: { type: Boolean, default: false },
    roomService: { type: Boolean, default: false },
    spaAccess: { type: Boolean, default: false },
    fitnessCenter: { type: Boolean, default: false },
    smartTV: { type: Boolean, default: false },
    loungeAccess: { type: Boolean, default: false },
  },
  latitude: { type: Number },
  longitude: { type: Number },
  images: [{ type: String }],
  threeDModel: { type: String },
  interiorTourLink: { type: String }, // New field
  deletedAt: { type: Date, default: null },
  bookings: [bookingSchema],
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('VacationSpot', vacationSpotSchema);