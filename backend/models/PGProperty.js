const mongoose = require('mongoose');

const pgPropertySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  monthlyRent: { type: Number, required: true },
  sharingOptions: {
    single: { type: Boolean, default: false },
    twoSharing: { type: Boolean, default: false },
    threeSharing: { type: Boolean, default: false },
    fourSharing: { type: Boolean, default: false },
  },
  description: { type: String, required: true },
  amenities: {
    wifi: { type: Boolean, default: false },
    tiffinService: { type: Boolean, default: false },
    tvRoom: { type: Boolean, default: false },
    laundry: { type: Boolean, default: false },
    bikeParking: { type: Boolean, default: false },
    hotWater: { type: Boolean, default: false },
    coffeeMachine: { type: Boolean, default: false },
    airConditioning: { type: Boolean, default: false },
  },
  latitude: { type: Number },
  longitude: { type: Number },
  images: [{ type: String }],
  threeDModel: { type: String },
  interiorTourLink: { type: String }, // New field
}, { timestamps: true });

module.exports = mongoose.model('PGProperty', pgPropertySchema);