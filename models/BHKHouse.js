const mongoose = require('mongoose');

const bhkHouseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  monthlyRent: { type: Number, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  squareFeet: { type: Number, required: true },
  description: { type: String, required: true },
  amenities: {
    carParking: { type: Boolean, default: false },
    wifiSetup: { type: Boolean, default: false },
    acUnits: { type: Boolean, default: false },
    furnished: { type: Boolean, default: false },
    securitySystem: { type: Boolean, default: false },
    geysers: { type: Boolean, default: false },
    ceilingFans: { type: Boolean, default: false },
    tvSetup: { type: Boolean, default: false },
    modularKitchen: { type: Boolean, default: false },
    extraStorage: { type: Boolean, default: false },
  },
  latitude: { type: Number },
  longitude: { type: Number },
  images: [{ type: String }],
  threeDModel: { type: String },
  interiorTourLink: { type: String },
  deletedAt: { type: Date, default: null }, // Added for soft deletion
}, { timestamps: true });

module.exports = mongoose.model('BHKHouse', bhkHouseSchema);