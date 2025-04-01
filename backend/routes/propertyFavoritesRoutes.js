const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const BanditStats = require('../models/banditStatsModel');
const PGProperty = require('../models/PGProperty');
const BHKHouse = require('../models/BHKHouse');
const VacationSpot = require('../models/VacationSpot');

// Favorite Route
router.post('/:propertyId/favorite', protect, async (req, res) => {
  const { propertyId } = req.params;
  const { isFavorited, propertyType } = req.body;
  const userId = req.user._id;

  console.log('Favorite request:', { propertyId, isFavorited, propertyType, userId });

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

    if (isFavorited) {
      const favorite = await Favorite.findOneAndUpdate(
        { user: userId, propertyId },
        { user: userId, propertyId, propertyType },
        { upsert: true, new: true }
      );
      console.log('Favorited:', favorite._id);

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
    } else {
      const result = await Favorite.deleteOne({ user: userId, propertyId });
      console.log('Unfavorited:', result);
    }

    res.json({ success: true, isFavorited });
  } catch (error) {
    console.error('Favorite error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;