const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');
const UserAction = require('../models/UserAction');
const PGProperty = require('../models/PGProperty');
const BHKHouse = require('../models/BHKHouse');
const VacationSpot = require('../models/VacationSpot');
const BanditStats = require('../models/banditStatsModel');

// Click Route
router.post('/click/:propertyId', protect, async (req, res) => {
  const { propertyId } = req.params;
  const { propertyType } = req.body;
  const userId = req.user._id;

  console.log('Click endpoint hit:', { propertyId, propertyType, userId });

  if (!['pg', 'bhk', 'vacation'].includes(propertyType)) {
    console.log('Invalid property type:', propertyType);
    return res.status(400).json({ message: 'Invalid property type' });
  }

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    console.log('Invalid propertyId:', propertyId);
    return res.status(400).json({ message: 'Invalid property ID' });
  }

  try {
    let property;
    if (propertyType === 'pg') property = await PGProperty.findOne({ _id: propertyId, deletedAt: null });
    else if (propertyType === 'bhk') property = await BHKHouse.findOne({ _id: propertyId, deletedAt: null });
    else if (propertyType === 'vacation') property = await VacationSpot.findOne({ _id: propertyId, deletedAt: null });

    console.log('Property lookup:', property ? property.propertyName : 'Not found', propertyId);

    if (!property) {
      console.log('Property not found or deleted:', propertyId);
      return res.status(404).json({ message: 'Property not found or deleted' });
    }

    await new UserAction({ userId, propertyId, propertyType, action: 'click' }).save();
    console.log('Clicked:', propertyId);

    res.json({ message: 'Click logged, weights updated, broo!' });
  } catch (error) {
    console.error('Click error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like Route
router.post('/like/:propertyId', protect, async (req, res) => {
  const { propertyId } = req.params;
  const { propertyType } = req.body;
  const userId = req.user._id;

  console.log('Like request:', { propertyId, propertyType, userId });

  if (!['pg', 'bhk', 'vacation'].includes(propertyType)) {
    return res.status(400).json({ message: 'Invalid property type' });
  }

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    console.log('Invalid propertyId:', propertyId);
    return res.status(400).json({ message: 'Invalid property ID' });
  }

  try {
    let property;
    if (propertyType === 'pg') property = await PGProperty.findById(propertyId);
    else if (propertyType === 'bhk') property = await BHKHouse.findById(propertyId);
    else if (propertyType === 'vacation') property = await VacationSpot.findById(propertyId);

    if (!property) {
      console.log('Property not found:', propertyId);
      return res.status(404).json({ message: 'Property not found' });
    }

    await new UserAction({ userId, propertyId, propertyType, action: 'like' }).save();
    console.log('Liked:', propertyId);

    let banditStats = await BanditStats.findOne({ userId });
    if (!banditStats) {
      banditStats = new BanditStats({ userId });
    }
    console.log('Raw banditStats from DB:', JSON.stringify(banditStats, null, 2));

    const rent = property.monthlyRent || (property.ratePerDay ? property.ratePerDay * 30 : 0) || 0;
    const size = property.squareFeet || property.maxGuests || 0;

    banditStats.rent.count += 1;
    banditStats.rent.avg = (banditStats.rent.avg * (banditStats.rent.count - 1) + rent) / banditStats.rent.count;

    banditStats.size.count += 1;
    banditStats.size.avg = (banditStats.size.avg * (banditStats.size.count - 1) + size) / banditStats.size.count;

    const city = property.city || 'Unknown';
    const cityStats = banditStats.location.cities.get(city) || { successes: 0, trials: 0 };
    cityStats.successes += 1;
    cityStats.trials += 1;
    banditStats.location.cities.set(city, cityStats);
    for (const [otherCity, stats] of banditStats.location.cities) {
      if (otherCity !== city) stats.trials += 1;
    }

    const state = property.state || 'Unknown';
    const stateStats = banditStats.location.states.get(state) || { successes: 0, trials: 0 };
    stateStats.successes += 1;
    stateStats.trials += 1;
    banditStats.location.states.set(state, stateStats);
    for (const [otherState, stats] of banditStats.location.states) {
      if (otherState !== state) stats.trials += 1;
    }

    const amenities = Object.entries(property.amenities || {}).filter(([_, v]) => v).map(([k]) => k);
    for (const amenity of amenities) {
      const amenityStats = banditStats.amenities.specific.get(amenity) || { successes: 0, trials: 0 };
      amenityStats.successes += 1;
      amenityStats.trials += 1;
      banditStats.amenities.specific.set(amenity, amenityStats);
    }
    for (const [otherAmenity, stats] of banditStats.amenities.specific) {
      if (!amenities.includes(otherAmenity)) stats.trials += 1;
    }

    banditStats.type[propertyType].successes += 1;
    banditStats.type[propertyType].trials += 1;
    for (const t of ['pg', 'bhk', 'vacation']) {
      if (t !== propertyType) banditStats.type[t].trials += 1;
    }

    console.log('banditStats before save:', JSON.stringify(banditStats, null, 2));
    await banditStats.save();
    console.log('BanditStats saved:', JSON.stringify(banditStats, null, 2));

    res.json({ message: 'Liked and weights updated, broo!' });
  } catch (error) {
    console.error('Like error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;