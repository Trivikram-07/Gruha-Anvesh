const PGProperty = require('../models/PGProperty');
const BHKHouse = require('../models/BHKHouse');
const VacationSpot = require('../models/VacationSpot');
const { validationResult } = require('express-validator');

const createPGProperty = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    console.log('req.user:', req.user);

    const {
      propertyName,
      contactNumber,
      address,
      monthlyRent,
      single,
      twoSharing,
      threeSharing,
      fourSharing,
      description,
      wifi,
      tiffinService,
      tvRoom,
      laundry,
      bikeParking,
      hotWater,
      coffeeMachine,
      airConditioning,
      latitude,
      longitude,
    } = req.body;

    const images = req.files && req.files['images'] ? req.files['images'].map(file => file.path) : [];
    const threeDModel = req.files && req.files['threeDModel'] ? req.files['threeDModel'][0].path : null;

    const user = req.user ? req.user.id : null;
    if (!user) {
      console.log('No user found in req.user');
      return res.status(401).json({ message: 'User authentication required' });
    }

    const pgProperty = new PGProperty({
      user,
      propertyName,
      contactNumber,
      address,
      monthlyRent: parseFloat(monthlyRent),
      sharingOptions: {
        single: single === 'true' || single === true,
        twoSharing: twoSharing === 'true' || twoSharing === true,
        threeSharing: threeSharing === 'true' || threeSharing === true,
        fourSharing: fourSharing === 'true' || fourSharing === true,
      },
      description,
      amenities: {
        wifi: wifi === 'true' || wifi === true,
        tiffinService: tiffinService === 'true' || tiffinService === true,
        tvRoom: tvRoom === 'true' || tvRoom === true,
        laundry: laundry === 'true' || laundry === true,
        bikeParking: bikeParking === 'true' || bikeParking === true,
        hotWater: hotWater === 'true' || hotWater === true,
        coffeeMachine: coffeeMachine === 'true' || coffeeMachine === true,
        airConditioning: airConditioning === 'true' || airConditioning === true,
      },
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      images,
      threeDModel,
    });

    console.log('Saving PG property:', pgProperty);
    await pgProperty.save();
    res.status(201).json({ message: 'PG Property listed successfully', pgProperty });
  } catch (error) {
    console.error('Error creating PG property:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createBhkProperty = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    console.log('req.user:', req.user);

    const {
      propertyName,
      contactNumber,
      address,
      monthlyRent,
      bedrooms,
      bathrooms,
      squareFeet,
      description,
      amenities,
      latitude,
      longitude,
    } = req.body;

    const images = req.files && req.files['images'] ? req.files['images'].map(file => file.path) : [];
    const threeDModel = req.files && req.files['threeDModel'] ? req.files['threeDModel'][0].path : null;

    const user = req.user ? req.user.id : null;
    if (!user) {
      console.log('No user found in req.user');
      return res.status(401).json({ message: 'User authentication required' });
    }

    const bhkHouse = new BHKHouse({
      user,
      propertyName,
      contactNumber,
      address,
      monthlyRent: parseFloat(monthlyRent),
      bedrooms: parseInt(bedrooms, 10),
      bathrooms: parseInt(bathrooms, 10),
      squareFeet: parseFloat(squareFeet),
      description,
      amenities: {
        carParking: amenities?.carParking === 'true' || amenities?.carParking === true,
        wifiSetup: amenities?.wifiSetup === 'true' || amenities?.wifiSetup === true,
        acUnits: amenities?.acUnits === 'true' || amenities?.acUnits === true,
        furnished: amenities?.furnished === 'true' || amenities?.furnished === true,
        securitySystem: amenities?.securitySystem === 'true' || amenities?.securitySystem === true,
        geysers: amenities?.geysers === 'true' || amenities?.geysers === true,
        ceilingFans: amenities?.ceilingFans === 'true' || amenities?.ceilingFans === true,
        tvSetup: amenities?.tvSetup === 'true' || amenities?.tvSetup === true,
        modularKitchen: amenities?.modularKitchen === 'true' || amenities?.modularKitchen === true,
        extraStorage: amenities?.extraStorage === 'true' || amenities?.extraStorage === true,
      },
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      images,
      threeDModel,
    });

    console.log('Saving BHK house:', bhkHouse);
    await bhkHouse.save();
    res.status(201).json({ message: 'BHK House listed successfully', bhkHouse });
  } catch (error) {
    console.error('Error creating BHK house:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createVacationSpot = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    console.log('req.user:', req.user);

    const {
      propertyName,
      contactNumber,
      address,
      ratePerDay,
      maxGuests,
      description,
      amenities,
      latitude,
      longitude,
    } = req.body;

    const images = req.files && req.files['images'] ? req.files['images'].map(file => file.path) : [];
    const threeDModel = req.files && req.files['threeDModel'] ? req.files['threeDModel'][0].path : null;

    const user = req.user ? req.user.id : null;
    if (!user) {
      console.log('No user found in req.user');
      return res.status(401).json({ message: 'User authentication required' });
    }

    const vacationSpot = new VacationSpot({
      user,
      propertyName,
      contactNumber,
      address,
      ratePerDay: parseFloat(ratePerDay),
      maxGuests: parseInt(maxGuests, 10),
      description,
      amenities: {
        beachAccess: amenities?.beachAccess === 'true' || amenities?.beachAccess === true,
        highSpeedWifi: amenities?.highSpeedWifi === 'true' || amenities?.highSpeedWifi === true,
        parkingSpace: amenities?.parkingSpace === 'true' || amenities?.parkingSpace === true,
        airConditioning: amenities?.airConditioning === 'true' || amenities?.airConditioning === true,
        kingSizeBed: amenities?.kingSizeBed === 'true' || amenities?.kingSizeBed === true,
        roomService: amenities?.roomService === 'true' || amenities?.roomService === true,
        spaAccess: amenities?.spaAccess === 'true' || amenities?.spaAccess === true,
        fitnessCenter: amenities?.fitnessCenter === 'true' || amenities?.fitnessCenter === true,
        smartTV: amenities?.smartTV === 'true' || amenities?.smartTV === true,
        loungeAccess: amenities?.loungeAccess === 'true' || amenities?.loungeAccess === true,
      },
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      images,
      threeDModel,
    });

    console.log('Saving Vacation Spot:', vacationSpot);
    await vacationSpot.save();
    res.status(201).json({ message: 'Vacation Spot listed successfully', vacationSpot });
  } catch (error) {
    console.error('Error creating vacation spot:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createPGProperty, createBhkProperty, createVacationSpot };