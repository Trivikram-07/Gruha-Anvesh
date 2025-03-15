const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware'); // Changed from `upload` to `{ upload }`
const { createPGProperty, createBhkProperty, createVacationSpot } = require('../controllers/propertyController');
const { check, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post(
  '/pg',
  protect,
  upload,
  [
    check('propertyName', 'Property name is required').not().isEmpty(),
    check('contactNumber', 'Contact number is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('monthlyRent', 'Monthly rent is required').isNumeric(),
    check('description', 'Description is required').not().isEmpty(),
    check('latitude', 'Latitude must be a number').isFloat().optional(),
    check('longitude', 'Longitude must be a number').isFloat().optional(),
    check('single', 'Single sharing must be a boolean').isBoolean().optional(),
    check('twoSharing', 'Two sharing must be a boolean').isBoolean().optional(),
    check('threeSharing', 'Three sharing must be a boolean').isBoolean().optional(),
    check('fourSharing', 'Four sharing must be a boolean').isBoolean().optional(),
    check('wifi', 'WiFi must be a boolean').isBoolean().optional(),
    check('tiffinService', 'Tiffin service must be a boolean').isBoolean().optional(),
    check('tvRoom', 'TV room must be a boolean').isBoolean().optional(),
    check('laundry', 'Laundry must be a boolean').isBoolean().optional(),
    check('bikeParking', 'Bike parking must be a boolean').isBoolean().optional(),
    check('hotWater', 'Hot water must be a boolean').isBoolean().optional(),
    check('coffeeMachine', 'Coffee machine must be a boolean').isBoolean().optional(),
    check('airConditioning', 'Air conditioning must be a boolean').isBoolean().optional(),
  ],
  validate,
  createPGProperty
);

router.post(
  '/bhk',
  protect,
  upload,
  [
    check('propertyName', 'Property name is required').not().isEmpty(),
    check('contactNumber', 'Contact number is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('monthlyRent', 'Monthly rent is required').isNumeric(),
    check('bedrooms', 'Number of bedrooms is required').isNumeric(),
    check('bathrooms', 'Number of bathrooms is required').isNumeric(),
    check('squareFeet', 'Square footage is required').isNumeric(),
    check('description', 'Description is required').not().isEmpty(),
    check('latitude', 'Latitude must be a number').isFloat().optional(),
    check('longitude', 'Longitude must be a number').isFloat().optional(),
    check('amenities.carParking', 'Car parking must be a boolean').isBoolean().optional(),
    check('amenities.wifiSetup', 'WiFi setup must be a boolean').isBoolean().optional(),
    check('amenities.acUnits', 'AC units must be a boolean').isBoolean().optional(),
    check('amenities.furnished', 'Furnished must be a boolean').isBoolean().optional(),
    check('amenities.securitySystem', 'Security system must be a boolean').isBoolean().optional(),
    check('amenities.geysers', 'Geysers must be a boolean').isBoolean().optional(),
    check('amenities.ceilingFans', 'Ceiling fans must be a boolean').isBoolean().optional(),
    check('amenities.tvSetup', 'TV setup must be a boolean').isBoolean().optional(),
    check('amenities.modularKitchen', 'Modular kitchen must be a boolean').isBoolean().optional(),
    check('amenities.extraStorage', 'Extra storage must be a boolean').isBoolean().optional(),
  ],
  validate,
  createBhkProperty
);

router.post(
  '/vacation',
  protect,
  upload,
  [
    check('propertyName', 'Property name is required').not().isEmpty(),
    check('contactNumber', 'Contact number is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('ratePerDay', 'Rate per day is required').isNumeric(),
    check('maxGuests', 'Maximum guests is required').isNumeric(),
    check('description', 'Description is required').not().isEmpty(),
    check('latitude', 'Latitude must be a number').isFloat().optional(),
    check('longitude', 'Longitude must be a number').isFloat().optional(),
    check('amenities.beachAccess', 'Beach access must be a boolean').isBoolean().optional(),
    check('amenities.highSpeedWifi', 'High-speed WiFi must be a boolean').isBoolean().optional(),
    check('amenities.parkingSpace', 'Parking space must be a boolean').isBoolean().optional(),
    check('amenities.airConditioning', 'Air conditioning must be a boolean').isBoolean().optional(),
    check('amenities.kingSizeBed', 'King size bed must be a boolean').isBoolean().optional(),
    check('amenities.roomService', 'Room service must be a boolean').isBoolean().optional(),
    check('amenities.spaAccess', 'Spa access must be a boolean').isBoolean().optional(),
    check('amenities.fitnessCenter', 'Fitness center must be a boolean').isBoolean().optional(),
    check('amenities.smartTV', 'Smart TV must be a boolean').isBoolean().optional(),
    check('amenities.loungeAccess', 'Lounge access must be a boolean').isBoolean().optional(),
  ],
  validate,
  createVacationSpot
);

module.exports = router;