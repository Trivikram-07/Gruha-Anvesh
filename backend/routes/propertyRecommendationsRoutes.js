const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const PGProperty = require('../models/PGProperty');
const BHKHouse = require('../models/BHKHouse');
const VacationSpot = require('../models/VacationSpot');
const BanditStats = require('../models/banditStatsModel');

// Recommendations Endpoint
router.get('/recommendations', protect, async (req, res) => {
  try {
    console.log('Starting personalized recommendations');
    const userId = req.user._id;

    const banditStats = await BanditStats.findOne({ userId });
    if (!banditStats) {
      console.log('No bandit stats found for user, returning generic recommendations');
      const allProperties = await fetchAllProperties();
      return res.json(allProperties.map(p => ({ ...p, score: 0.5 })));
    }

    console.log('BanditStats found:', JSON.stringify(banditStats, null, 2));
    
    const allProperties = await fetchAllProperties();
    console.log(`Total properties fetched: ${allProperties.length}`);

    // Calculate personalized scores
    const scoredProperties = allProperties.map(property => {
      // Start with a base score
      let baseScore = 0.5;
      let weightSum = 0;
      let scoreSum = 0;
      
      // 1. Score by property type (25% weight)
      const typeWeight = 0.25;
      const typeStats = banditStats.type[property.type] || { successes: 0, trials: 0 };
      const typeScore = typeStats.trials > 0 ? typeStats.successes / typeStats.trials : 0.5;
      scoreSum += typeScore * typeWeight;
      weightSum += typeWeight;
      
      // 2. Score by rent/price proximity (20% weight)
      const rentWeight = 0.20;
      if (banditStats.rent.count > 0) {
        const propertyRent = property.monthlyRent || (property.ratePerDay ? property.ratePerDay * 30 : 0);
        // Calculate similarity using a Gaussian-like function (closer = higher score)
        // Score will be between 0-1 with 1 being perfect match
        const avgRent = banditStats.rent.avg;
        const rentDistance = Math.abs(propertyRent - avgRent);
        const rentSimilarity = Math.exp(-Math.pow(rentDistance / avgRent, 2));
        scoreSum += rentSimilarity * rentWeight;
        weightSum += rentWeight;
      }
      
      // 3. Score by size proximity (15% weight)
      const sizeWeight = 0.15;
      if (banditStats.size.count > 0) {
        const propertySize = property.squareFeet || property.maxGuests || 0;
        const avgSize = banditStats.size.avg;
        if (avgSize > 0 && propertySize > 0) {
          const sizeDistance = Math.abs(propertySize - avgSize);
          const sizeSimilarity = Math.exp(-Math.pow(sizeDistance / avgSize, 2));
          scoreSum += sizeSimilarity * sizeWeight;
          weightSum += sizeWeight;
        }
      }
      
      // 4. Score by location (20% weight)
      const locationWeight = 0.20;
      let locationScore = 0.5; // Default score
      
      // City preference
      const city = property.city || 'Unknown';
      const cityStats = banditStats.location.cities.get(city);
      if (cityStats && cityStats.trials > 0) {
        locationScore = cityStats.successes / cityStats.trials;
      } else {
        // If no city stats, check state
        const state = property.state || 'Unknown';
        const stateStats = banditStats.location.states.get(state);
        if (stateStats && stateStats.trials > 0) {
          locationScore = stateStats.successes / stateStats.trials;
        }
      }
      
      scoreSum += locationScore * locationWeight;
      weightSum += locationWeight;
      
      // 5. Score by amenities (20% weight)
      const amenitiesWeight = 0.20;
      let amenitiesScore = 0.5; // Default score
      let amenityCount = 0;
      let amenityScoreSum = 0;
      
      // Get all amenities this property has
      const propertyAmenities = Object.entries(property.amenities || {})
        .filter(([_, v]) => v)
        .map(([k]) => k);
      
      // Score each amenity
      for (const amenity of propertyAmenities) {
        const amenityStats = banditStats.amenities.specific.get(amenity);
        if (amenityStats && amenityStats.trials > 0) {
          amenityScoreSum += amenityStats.successes / amenityStats.trials;
          amenityCount++;
        }
      }
      
      // Calculate average amenity score if any were found
      if (amenityCount > 0) {
        amenitiesScore = amenityScoreSum / amenityCount;
      }
      
      scoreSum += amenitiesScore * amenitiesWeight;
      weightSum += amenitiesWeight;
      
      // Normalize the final score
      const finalScore = weightSum > 0 ? scoreSum / weightSum : baseScore;
      
      // Add exploration bonus for properties with fewer views (epsilon)
      // This helps discover new preferences by occasionally showing new options
      const explorationBonus = Math.random() * 0.05; // 5% random boost
      
      return { 
        ...property, 
        score: Math.min(finalScore + explorationBonus, 1),
        _debug: {
          typeScore,
          rentScore: banditStats.rent.count > 0 ? Math.exp(-Math.pow(Math.abs(property.monthlyRent || (property.ratePerDay ? property.ratePerDay * 30 : 0) - banditStats.rent.avg) / banditStats.rent.avg, 2)) : 'N/A',
          locationScore,
          amenitiesScore: amenityCount > 0 ? amenitiesScore : 'N/A'
        }
      };
    });

    // Sort by score (highest first)
    scoredProperties.sort((a, b) => b.score - a.score);
    
    // Remove debug info before sending to client
    const finalProperties = scoredProperties.map(({ _debug, ...rest }) => rest);
    
    console.log('Top 5 recommended properties:', 
      finalProperties.slice(0, 5).map(p => ({ 
        id: p._id, 
        name: p.propertyName, 
        type: p.type, 
        score: p.score.toFixed(2) 
      }))
    );
    
    res.json(finalProperties);
  } catch (error) {
    console.error('Recommendations error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to fetch all properties
async function fetchAllProperties() {
  const pgProperties = await PGProperty.find({ deletedAt: null });
  const bhkProperties = await BHKHouse.find({ deletedAt: null });
  const vacationProperties = await VacationSpot.find({ deletedAt: null });
  
  return [
    ...pgProperties.map(p => ({ ...p.toObject(), type: 'pg' })),
    ...bhkProperties.map(p => ({ ...p.toObject(), type: 'bhk' })),
    ...vacationProperties.map(p => ({ ...p.toObject(), type: 'vacation' })),
  ];
}

module.exports = router;