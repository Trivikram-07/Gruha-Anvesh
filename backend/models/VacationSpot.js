const mongoose = require('mongoose');

const vacationSpotSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  address: { type: String, required: true },
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
  latitude: { type: Number, required: false },
  longitude: { type: Number, required: false },
  images: [{ type: String }],
  threeDModel: { type: String },
});

module.exports = mongoose.model('VacationSpot', vacationSpotSchema);