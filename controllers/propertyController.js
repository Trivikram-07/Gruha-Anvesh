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
    console.log('Received req.body:', req.body);
    console.log('Received req.files:', req.files);
    console.log('Received req.user:', req.user);

    const {
      propertyName,
      contactNumber,
      address,
      city,
      state,
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
      interiorTourLink, // New field
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
      city,
      state,
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
      interiorTourLink, // New field
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
      city,
      state,
      bedrooms,
      bathrooms,
      squareFeet,
      description,
      carParking,
      wifiSetup,
      acUnits,
      furnished,
      securitySystem,
      geysers,
      ceilingFans,
      tvSetup,
      modularKitchen,
      extraStorage,
      latitude,
      longitude,
      interiorTourLink, // New field
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
      city,
      state,
      monthlyRent: parseFloat(monthlyRent),
      bedrooms: parseInt(bedrooms, 10),
      bathrooms: parseInt(bathrooms, 10),
      squareFeet: parseFloat(squareFeet),
      description,
      amenities: {
        carParking: carParking === 'true' || carParking === true,
        wifiSetup: wifiSetup === 'true' || wifiSetup === true,
        acUnits: acUnits === 'true' || acUnits === true,
        furnished: furnished === 'true' || furnished === true,
        securitySystem: securitySystem === 'true' || securitySystem === true,
        geysers: geysers === 'true' || geysers === true,
        ceilingFans: ceilingFans === 'true' || ceilingFans === true,
        tvSetup: tvSetup === 'true' || tvSetup === true,
        modularKitchen: modularKitchen === 'true' || modularKitchen === true,
        extraStorage: extraStorage === 'true' || extraStorage === true,
      },
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      images,
      threeDModel,
      interiorTourLink, // New field
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
      city,
      state,
      ratePerDay,
      maxGuests,
      description,
      beachAccess,
      highSpeedWifi,
      parkingSpace,
      airConditioning,
      kingSizeBed,
      roomService,
      spaAccess,
      fitnessCenter,
      smartTV,
      loungeAccess,
      latitude,
      longitude,
      interiorTourLink, // New field
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
      city,
      state,
      ratePerDay: parseFloat(ratePerDay),
      maxGuests: parseInt(maxGuests, 10),
      description,
      amenities: {
        beachAccess: beachAccess === 'true' || beachAccess === true,
        highSpeedWifi: highSpeedWifi === 'true' || highSpeedWifi === true,
        parkingSpace: parkingSpace === 'true' || parkingSpace === true,
        airConditioning: airConditioning === 'true' || airConditioning === true,
        kingSizeBed: kingSizeBed === 'true' || kingSizeBed === true,
        roomService: roomService === 'true' || roomService === true,
        spaAccess: spaAccess === 'true' || spaAccess === true,
        fitnessCenter: fitnessCenter === 'true' || fitnessCenter === true,
        smartTV: smartTV === 'true' || smartTV === true,
        loungeAccess: loungeAccess === 'true' || loungeAccess === true,
      },
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      images,
      threeDModel,
      interiorTourLink, // New field
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