// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');
// const { protect, optionalAuth } = require('../middleware/authMiddleware');
// const { upload } = require('../middleware/uploadMiddleware');
// const { createPGProperty, createBhkProperty, createVacationSpot } = require('../controllers/propertyController');
// const { check, validationResult } = require('express-validator');
// const PGProperty = require('../models/PGProperty');
// const BHKHouse = require('../models/BHKHouse');
// const VacationSpot = require('../models/VacationSpot');
// const User = require('../models/userModel');
// const UserAction = require('../models/UserAction');
// const Favorite = require('../models/Favorite');
// const BanditStats = require('../models/banditStatsModel');
// const Message = require('../models/Message');
// const Notification = require('../models/Notification');

// const validate = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     console.log('Validation errors:', errors.array());
//     return res.status(400).json({ errors: errors.array() });
//   }
//   next();
// };

// // Test Route
// router.get('/test', (req, res) => {
//   console.log('Test route hit');
//   res.json({ message: 'Test route works, broo!' });
// });

// // User Actions
// router.get('/user-actions', protect, async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const actions = await UserAction.find({ userId })
//       .populate('propertyId', 'propertyName')
//       .lean();
//     console.log(`Fetched actions for user ${userId}:`, actions);
//     res.json(actions);
//   } catch (error) {
//     console.error('Error fetching user actions:', error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Property Creation Routes
// router.post('/pg', protect, upload, [
//   check('propertyName', 'Property name is required').not().isEmpty(),
//   check('contactNumber', 'Contact number is required').not().isEmpty(),
//   check('address', 'Address is required').not().isEmpty(),
//   check('city', 'City is required').not().isEmpty(),
//   check('state', 'State is required').not().isEmpty(),
//   check('monthlyRent', 'Monthly rent is required').not().isEmpty(),
//   check('description', 'Description is required').not().isEmpty(),
//   check('latitude', 'Latitude must be a number').isFloat().optional(),
//   check('longitude', 'Longitude must be a number').isFloat().optional(),
//   check('single', 'Single sharing must be a boolean').isBoolean().optional(),
//   check('twoSharing', 'Two sharing must be a boolean').isBoolean().optional(),
//   check('threeSharing', 'Three sharing must be a boolean').isBoolean().optional(),
//   check('fourSharing', 'Four sharing must be a boolean').isBoolean().optional(),
//   check('wifi', 'WiFi must be a boolean').isBoolean().optional(),
//   check('tiffinService', 'Tiffin service must be a boolean').isBoolean().optional(),
//   check('tvRoom', 'TV room must be a boolean').isBoolean().optional(),
//   check('laundry', 'Laundry must be a boolean').isBoolean().optional(),
//   check('bikeParking', 'Bike parking must be a boolean').isBoolean().optional(),
//   check('hotWater', 'Hot water must be a boolean').isBoolean().optional(),
//   check('coffeeMachine', 'Coffee machine must be a boolean').isBoolean().optional(),
//   check('airConditioning', 'Air conditioning must be a boolean').isBoolean().optional(),
// ], validate, createPGProperty);

// router.post('/bhk', protect, upload, [
//   check('propertyName', 'Property name is required').not().isEmpty(),
//   check('contactNumber', 'Contact number is required').not().isEmpty(),
//   check('address', 'Address is required').not().isEmpty(),
//   check('city', 'City is required').not().isEmpty(),
//   check('state', 'State is required').not().isEmpty(),
//   check('monthlyRent', 'Monthly rent is required').not().isEmpty(),
//   check('bedrooms', 'Number of bedrooms is required').toInt().isInt({ min: 1 }),
//   check('bathrooms', 'Number of bathrooms is required').toInt().isInt({ min: 1 }),
//   check('squareFeet', 'Square footage is required').not().isEmpty(),
//   check('description', 'Description is required').not().isEmpty(),
//   check('latitude', 'Latitude must be a number').isFloat().optional(),
//   check('longitude', 'Longitude must be a number').isFloat().optional(),
//   check('carParking', 'Car parking must be a boolean').isBoolean().optional(),
//   check('wifiSetup', 'WiFi setup must be a boolean').isBoolean().optional(),
//   check('acUnits', 'AC units must be a boolean').isBoolean().optional(),
//   check('furnished', 'Furnished must be a boolean').isBoolean().optional(),
//   check('securitySystem', 'Security system must be a boolean').isBoolean().optional(),
//   check('geysers', 'Geysers must be a boolean').isBoolean().optional(),
//   check('ceilingFans', 'Ceiling fans must be a boolean').isBoolean().optional(),
//   check('tvSetup', 'TV setup must be a boolean').isBoolean().optional(),
//   check('modularKitchen', 'Modular kitchen must be a boolean').isBoolean().optional(),
//   check('extraStorage', 'Extra storage must be a boolean').isBoolean().optional(),
// ], validate, createBhkProperty);

// router.post('/vacation', protect, upload, [
//   check('propertyName', 'Property name is required').not().isEmpty(),
//   check('contactNumber', 'Contact number is required').not().isEmpty(),
//   check('address', 'Address is required').not().isEmpty(),
//   check('city', 'City is required').not().isEmpty(),
//   check('state', 'State is required').not().isEmpty(),
//   check('ratePerDay', 'Rate per day is required').not().isEmpty(),
//   check('maxGuests', 'Maximum guests is required').toInt().isInt({ min: 1 }),
//   check('description', 'Description is required').not().isEmpty(),
//   check('latitude', 'Latitude must be a number').isFloat().optional(),
//   check('longitude', 'Longitude must be a number').isFloat().optional(),
//   check('beachAccess', 'Beach access must be a boolean').isBoolean().optional(),
//   check('highSpeedWifi', 'High-speed WiFi must be a boolean').isBoolean().optional(),
//   check('parkingSpace', 'Parking space must be a boolean').isBoolean().optional(),
//   check('airConditioning', 'Air conditioning must be a boolean').isBoolean().optional(),
//   check('kingSizeBed', 'King size bed must be a boolean').isBoolean().optional(),
//   check('roomService', 'Room service must be a boolean').isBoolean().optional(),
//   check('spaAccess', 'Spa access must be a boolean').isBoolean().optional(),
//   check('fitnessCenter', 'Fitness center must be a boolean').isBoolean().optional(),
//   check('smartTV', 'Smart TV must be a boolean').isBoolean().optional(),
//   check('loungeAccess', 'Lounge access must be a boolean').isBoolean().optional(),
// ], validate, createVacationSpot);

// // Click Route
// router.post('/click/:propertyId', protect, async (req, res) => {
//   const { propertyId } = req.params;
//   const { propertyType } = req.body;
//   const userId = req.user._id;

//   console.log('Click endpoint hit:', { propertyId, propertyType, userId });

//   if (!['pg', 'bhk', 'vacation'].includes(propertyType)) {
//     console.log('Invalid property type:', propertyType);
//     return res.status(400).json({ message: 'Invalid property type' });
//   }

//   if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//     console.log('Invalid propertyId:', propertyId);
//     return res.status(400).json({ message: 'Invalid property ID' });
//   }

//   try {
//     let property;
//     if (propertyType === 'pg') property = await PGProperty.findOne({ _id: propertyId, deletedAt: null });
//     else if (propertyType === 'bhk') property = await BHKHouse.findOne({ _id: propertyId, deletedAt: null });
//     else if (propertyType === 'vacation') property = await VacationSpot.findOne({ _id: propertyId, deletedAt: null });

//     console.log('Property lookup:', property ? property.propertyName : 'Not found', propertyId);

//     if (!property) {
//       console.log('Property not found or deleted:', propertyId);
//       return res.status(404).json({ message: 'Property not found or deleted' });
//     }

//     await new UserAction({ userId, propertyId, propertyType, action: 'click' }).save();
//     console.log('Clicked:', propertyId);

//     res.json({ message: 'Click logged, weights updated, broo!' });
//   } catch (error) {
//     console.error('Click error:', error.message, error.stack);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Favorite Route
// router.post('/:propertyId/favorite', protect, async (req, res) => {
//   const { propertyId } = req.params;
//   const { isFavorited, propertyType } = req.body;
//   const userId = req.user._id;

//   console.log('Favorite request:', { propertyId, isFavorited, propertyType, userId });

//   if (!['pg', 'bhk', 'vacation'].includes(propertyType)) {
//     return res.status(400).json({ message: 'Invalid property type' });
//   }

//   if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//     console.log('Invalid propertyId:', propertyId);
//     return res.status(400).json({ message: 'Invalid property ID' });
//   }

//   try {
//     let property;
//     if (propertyType === 'pg') property = await PGProperty.findById(propertyId);
//     else if (propertyType === 'bhk') property = await BHKHouse.findById(propertyId);
//     else if (propertyType === 'vacation') property = await VacationSpot.findById(propertyId);

//     if (!property) {
//       console.log('Property not found:', propertyId);
//       return res.status(404).json({ message: 'Property not found' });
//     }

//     if (isFavorited) {
//       const favorite = await Favorite.findOneAndUpdate(
//         { user: userId, propertyId },
//         { user: userId, propertyId, propertyType },
//         { upsert: true, new: true }
//       );
//       console.log('Favorited:', favorite._id);

//       let banditStats = await BanditStats.findOne({ userId });
//       if (!banditStats) {
//         banditStats = new BanditStats({ userId });
//       }
//       console.log('Raw banditStats from DB:', JSON.stringify(banditStats, null, 2));

//       const rent = property.monthlyRent || (property.ratePerDay ? property.ratePerDay * 30 : 0) || 0;
//       const size = property.squareFeet || property.maxGuests || 0;

//       banditStats.rent.count += 1;
//       banditStats.rent.avg = (banditStats.rent.avg * (banditStats.rent.count - 1) + rent) / banditStats.rent.count;

//       banditStats.size.count += 1;
//       banditStats.size.avg = (banditStats.size.avg * (banditStats.size.count - 1) + size) / banditStats.size.count;

//       const city = property.city || 'Unknown';
//       const cityStats = banditStats.location.cities.get(city) || { successes: 0, trials: 0 };
//       cityStats.successes += 1;
//       cityStats.trials += 1;
//       banditStats.location.cities.set(city, cityStats);
//       for (const [otherCity, stats] of banditStats.location.cities) {
//         if (otherCity !== city) stats.trials += 1;
//       }

//       const state = property.state || 'Unknown';
//       const stateStats = banditStats.location.states.get(state) || { successes: 0, trials: 0 };
//       stateStats.successes += 1;
//       stateStats.trials += 1;
//       banditStats.location.states.set(state, stateStats);
//       for (const [otherState, stats] of banditStats.location.states) {
//         if (otherState !== state) stats.trials += 1;
//       }

//       const amenities = Object.entries(property.amenities || {}).filter(([_, v]) => v).map(([k]) => k);
//       for (const amenity of amenities) {
//         const amenityStats = banditStats.amenities.specific.get(amenity) || { successes: 0, trials: 0 };
//         amenityStats.successes += 1;
//         amenityStats.trials += 1;
//         banditStats.amenities.specific.set(amenity, amenityStats);
//       }
//       for (const [otherAmenity, stats] of banditStats.amenities.specific) {
//         if (!amenities.includes(otherAmenity)) stats.trials += 1;
//       }

//       banditStats.type[propertyType].successes += 1;
//       banditStats.type[propertyType].trials += 1;
//       for (const t of ['pg', 'bhk', 'vacation']) {
//         if (t !== propertyType) banditStats.type[t].trials += 1;
//       }

//       console.log('banditStats before save:', JSON.stringify(banditStats, null, 2));
//       await banditStats.save();
//       console.log('BanditStats saved:', JSON.stringify(banditStats, null, 2));
//     } else {
//       const result = await Favorite.deleteOne({ user: userId, propertyId });
//       console.log('Unfavorited:', result);
//     }

//     res.json({ success: true, isFavorited });
//   } catch (error) {
//     console.error('Favorite error:', error.message, error.stack);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // My Bookings Route
// router.get('/my-bookings/vacation', protect, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     console.log('Fetching vacation bookings for user:', userId);

//     const vacationSpots = await VacationSpot.find({
//       'bookings.user': userId,
//     }).lean();

//     const bookings = vacationSpots.flatMap(spot =>
//       (spot.bookings || []).filter(booking => booking.user.toString() === userId).map(booking => ({
//         propertyId: spot._id,
//         propertyName: spot.propertyName,
//         address: spot.address,
//         startDate: booking.startDate,
//         endDate: booking.endDate,
//         ratePerDay: spot.ratePerDay,
//       }))
//     );

//     console.log('Vacation bookings fetched:', bookings);
//     res.json(bookings);
//   } catch (error) {
//     console.error('Error fetching vacation bookings:', error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Get Bookings for a Specific Property
// router.get('/:propertyId/bookings', optionalAuth, async (req, res) => {
//   const { propertyId } = req.params;

//   console.log('Fetching bookings for propertyId:', propertyId);

//   if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//     console.log('Invalid propertyId:', propertyId);
//     return res.status(400).json({ message: 'Invalid property ID' });
//   }

//   try {
//     const property = await VacationSpot.findById(propertyId);
//     if (!property || property.deletedAt) {
//       console.log('Property not found or deleted:', propertyId);
//       return res.status(404).json({ message: 'Property not found or deleted' });
//     }

//     const bookings = (property.bookings || []).map(booking => ({
//       startDate: booking.startDate,
//       endDate: booking.endDate,
//       user: booking.user.toString(),
//     }));

//     console.log('Bookings fetched:', bookings);
//     res.json(bookings);
//   } catch (error) {
//     console.error('Error fetching bookings:', error.message, error.stack);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Like Route
// router.post('/like/:propertyId', protect, async (req, res) => {
//   const { propertyId } = req.params;
//   const { propertyType } = req.body;
//   const userId = req.user._id;

//   console.log('Like request:', { propertyId, propertyType, userId });

//   if (!['pg', 'bhk', 'vacation'].includes(propertyType)) {
//     return res.status(400).json({ message: 'Invalid property type' });
//   }

//   if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//     console.log('Invalid propertyId:', propertyId);
//     return res.status(400).json({ message: 'Invalid property ID' });
//   }

//   try {
//     let property;
//     if (propertyType === 'pg') property = await PGProperty.findById(propertyId);
//     else if (propertyType === 'bhk') property = await BHKHouse.findById(propertyId);
//     else if (propertyType === 'vacation') property = await VacationSpot.findById(propertyId);

//     if (!property) {
//       console.log('Property not found:', propertyId);
//       return res.status(404).json({ message: 'Property not found' });
//     }

//     await new UserAction({ userId, propertyId, propertyType, action: 'like' }).save();
//     console.log('Liked:', propertyId);

//     let banditStats = await BanditStats.findOne({ userId });
//     if (!banditStats) {
//       banditStats = new BanditStats({ userId });
//     }
//     console.log('Raw banditStats from DB:', JSON.stringify(banditStats, null, 2));

//     const rent = property.monthlyRent || (property.ratePerDay ? property.ratePerDay * 30 : 0) || 0;
//     const size = property.squareFeet || property.maxGuests || 0;

//     banditStats.rent.count += 1;
//     banditStats.rent.avg = (banditStats.rent.avg * (banditStats.rent.count - 1) + rent) / banditStats.rent.count;

//     banditStats.size.count += 1;
//     banditStats.size.avg = (banditStats.size.avg * (banditStats.size.count - 1) + size) / banditStats.size.count;

//     const city = property.city || 'Unknown';
//     const cityStats = banditStats.location.cities.get(city) || { successes: 0, trials: 0 };
//     cityStats.successes += 1;
//     cityStats.trials += 1;
//     banditStats.location.cities.set(city, cityStats);
//     for (const [otherCity, stats] of banditStats.location.cities) {
//       if (otherCity !== city) stats.trials += 1;
//     }

//     const state = property.state || 'Unknown';
//     const stateStats = banditStats.location.states.get(state) || { successes: 0, trials: 0 };
//     stateStats.successes += 1;
//     stateStats.trials += 1;
//     banditStats.location.states.set(state, stateStats);
//     for (const [otherState, stats] of banditStats.location.states) {
//       if (otherState !== state) stats.trials += 1;
//     }

//     const amenities = Object.entries(property.amenities || {}).filter(([_, v]) => v).map(([k]) => k);
//     for (const amenity of amenities) {
//       const amenityStats = banditStats.amenities.specific.get(amenity) || { successes: 0, trials: 0 };
//       amenityStats.successes += 1;
//       amenityStats.trials += 1;
//       banditStats.amenities.specific.set(amenity, amenityStats);
//     }
//     for (const [otherAmenity, stats] of banditStats.amenities.specific) {
//       if (!amenities.includes(otherAmenity)) stats.trials += 1;
//     }

//     banditStats.type[propertyType].successes += 1;
//     banditStats.type[propertyType].trials += 1;
//     for (const t of ['pg', 'bhk', 'vacation']) {
//       if (t !== propertyType) banditStats.type[t].trials += 1;
//     }

//     console.log('banditStats before save:', JSON.stringify(banditStats, null, 2));
//     await banditStats.save();
//     console.log('BanditStats saved:', JSON.stringify(banditStats, null, 2));

//     res.json({ message: 'Liked and weights updated, broo!' });
//   } catch (error) {
//     console.error('Like error:', error.message, error.stack);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Booking Route
// router.post('/:propertyId/book', protect, async (req, res) => {
//   const { propertyId } = req.params;
//   const { startDate, endDate, numGuests } = req.body;
//   const userId = req.user.id;

//   console.log('Booking request:', { propertyId, startDate, endDate, numGuests, userId });

//   if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//     console.log('Invalid propertyId:', propertyId);
//     return res.status(400).json({ message: 'Invalid property ID' });
//   }

//   if (!numGuests || numGuests < 1) {
//     return res.status(400).json({ message: 'Number of guests must be at least 1' });
//   }

//   try {
//     const property = await VacationSpot.findById(propertyId);
//     if (!property || property.deletedAt) {
//       console.log('Property not found or deleted:', propertyId);
//       return res.status(404).json({ message: 'Property not found or deleted' });
//     }

//     if (numGuests > property.maxGuests) {
//       return res.status(400).json({ message: `Number of guests exceeds max capacity (${property.maxGuests})` });
//     }

//     const newStart = new Date(startDate);
//     const newEnd = new Date(endDate);
//     const isOverlap = property.bookings.some(booking => {
//       const existingStart = new Date(booking.startDate);
//       const existingEnd = new Date(booking.endDate);
//       return (newStart <= existingEnd && newEnd >= existingStart);
//     });

//     if (isOverlap) {
//       console.log('Booking overlap detected:', { startDate, endDate });
//       return res.status(400).json({ message: 'Dates already booked' });
//     }

//     property.bookings.push({ startDate, endDate, user: userId, reviewPrompted: false, numGuests });
//     await property.save();

//     const notification = new Notification({
//       user: userId,
//       message: `Booking for ${property.propertyName} successful!`,
//       type: 'success',
//       propertyId,
//       propertyType: 'vacation', // Aligned with Booking.tsx and app.js
//     });
//     await notification.save();

//     req.io.to(userId).emit('bookingSuccess', {
//       propertyId,
//       propertyName: property.propertyName,
//     });

//     res.json({ message: 'Booking saved', booking: { startDate, endDate, numGuests } });
//   } catch (error) {
//     console.error('Booking error:', error.message, error.stack);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Notifications
// router.get('/notifications', protect, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const notifications = await Notification.find({ user: userId })
//       .sort({ timestamp: -1 })
//       .lean();
//     console.log(`Fetched ${notifications.length} notifications for user ${userId}`);
//     res.json(notifications);
//   } catch (error) {
//     console.error('Error fetching notifications:', error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// router.patch('/notifications/:notificationId/read', protect, async (req, res) => {
//   const { notificationId } = req.params;
//   const userId = req.user.id;

//   if (!mongoose.Types.ObjectId.isValid(notificationId)) {
//     console.log('Invalid notificationId:', notificationId);
//     return res.status(400).json({ message: 'Invalid notification ID' });
//   }

//   try {
//     const notification = await Notification.findOneAndUpdate(
//       { _id: notificationId, user: userId },
//       { isRead: true },
//       { new: true }
//     );
//     if (!notification) {
//       console.log('Notification not found or not owned by user:', notificationId);
//       return res.status(404).json({ message: 'Notification not found or not yours' });
//     }
//     console.log(`Notification ${notificationId} marked as read for user ${userId}`);
//     res.json(notification);
//   } catch (error) {
//     console.error('Error marking notification as read:', error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Recommendations Endpoint
// // Enhanced Recommendations Endpoint
// router.get('/recommendations', protect, async (req, res) => {
//   try {
//     console.log('Starting personalized recommendations');
//     const userId = req.user._id;

//     const banditStats = await BanditStats.findOne({ userId });
//     if (!banditStats) {
//       console.log('No bandit stats found for user, returning generic recommendations');
//       const allProperties = await fetchAllProperties();
//       return res.json(allProperties.map(p => ({ ...p, score: 0.5 })));
//     }

//     console.log('BanditStats found:', JSON.stringify(banditStats, null, 2));
    
//     const allProperties = await fetchAllProperties();
//     console.log(`Total properties fetched: ${allProperties.length}`);

//     // Calculate personalized scores
//     const scoredProperties = allProperties.map(property => {
//       // Start with a base score
//       let baseScore = 0.5;
//       let weightSum = 0;
//       let scoreSum = 0;
      
//       // 1. Score by property type (25% weight)
//       const typeWeight = 0.25;
//       const typeStats = banditStats.type[property.type] || { successes: 0, trials: 0 };
//       const typeScore = typeStats.trials > 0 ? typeStats.successes / typeStats.trials : 0.5;
//       scoreSum += typeScore * typeWeight;
//       weightSum += typeWeight;
      
//       // 2. Score by rent/price proximity (20% weight)
//       const rentWeight = 0.20;
//       if (banditStats.rent.count > 0) {
//         const propertyRent = property.monthlyRent || (property.ratePerDay ? property.ratePerDay * 30 : 0);
//         // Calculate similarity using a Gaussian-like function (closer = higher score)
//         // Score will be between 0-1 with 1 being perfect match
//         const avgRent = banditStats.rent.avg;
//         const rentDistance = Math.abs(propertyRent - avgRent);
//         const rentSimilarity = Math.exp(-Math.pow(rentDistance / avgRent, 2));
//         scoreSum += rentSimilarity * rentWeight;
//         weightSum += rentWeight;
//       }
      
//       // 3. Score by size proximity (15% weight)
//       const sizeWeight = 0.15;
//       if (banditStats.size.count > 0) {
//         const propertySize = property.squareFeet || property.maxGuests || 0;
//         const avgSize = banditStats.size.avg;
//         if (avgSize > 0 && propertySize > 0) {
//           const sizeDistance = Math.abs(propertySize - avgSize);
//           const sizeSimilarity = Math.exp(-Math.pow(sizeDistance / avgSize, 2));
//           scoreSum += sizeSimilarity * sizeWeight;
//           weightSum += sizeWeight;
//         }
//       }
      
//       // 4. Score by location (20% weight)
//       const locationWeight = 0.20;
//       let locationScore = 0.5; // Default score
      
//       // City preference
//       const city = property.city || 'Unknown';
//       const cityStats = banditStats.location.cities.get(city);
//       if (cityStats && cityStats.trials > 0) {
//         locationScore = cityStats.successes / cityStats.trials;
//       } else {
//         // If no city stats, check state
//         const state = property.state || 'Unknown';
//         const stateStats = banditStats.location.states.get(state);
//         if (stateStats && stateStats.trials > 0) {
//           locationScore = stateStats.successes / stateStats.trials;
//         }
//       }
      
//       scoreSum += locationScore * locationWeight;
//       weightSum += locationWeight;
      
//       // 5. Score by amenities (20% weight)
//       const amenitiesWeight = 0.20;
//       let amenitiesScore = 0.5; // Default score
//       let amenityCount = 0;
//       let amenityScoreSum = 0;
      
//       // Get all amenities this property has
//       const propertyAmenities = Object.entries(property.amenities || {})
//         .filter(([_, v]) => v)
//         .map(([k]) => k);
      
//       // Score each amenity
//       for (const amenity of propertyAmenities) {
//         const amenityStats = banditStats.amenities.specific.get(amenity);
//         if (amenityStats && amenityStats.trials > 0) {
//           amenityScoreSum += amenityStats.successes / amenityStats.trials;
//           amenityCount++;
//         }
//       }
      
//       // Calculate average amenity score if any were found
//       if (amenityCount > 0) {
//         amenitiesScore = amenityScoreSum / amenityCount;
//       }
      
//       scoreSum += amenitiesScore * amenitiesWeight;
//       weightSum += amenitiesWeight;
      
//       // Normalize the final score
//       const finalScore = weightSum > 0 ? scoreSum / weightSum : baseScore;
      
//       // Add exploration bonus for properties with fewer views (epsilon)
//       // This helps discover new preferences by occasionally showing new options
//       const explorationBonus = Math.random() * 0.05; // 5% random boost
      
//       return { 
//         ...property, 
//         score: Math.min(finalScore + explorationBonus, 1),
//         _debug: {
//           typeScore,
//           rentScore: banditStats.rent.count > 0 ? Math.exp(-Math.pow(Math.abs(property.monthlyRent || (property.ratePerDay ? property.ratePerDay * 30 : 0) - banditStats.rent.avg) / banditStats.rent.avg, 2)) : 'N/A',
//           locationScore,
//           amenitiesScore: amenityCount > 0 ? amenitiesScore : 'N/A'
//         }
//       };
//     });

//     // Sort by score (highest first)
//     scoredProperties.sort((a, b) => b.score - a.score);
    
//     // Remove debug info before sending to client
//     const finalProperties = scoredProperties.map(({ _debug, ...rest }) => rest);
    
//     console.log('Top 5 recommended properties:', 
//       finalProperties.slice(0, 5).map(p => ({ 
//         id: p._id, 
//         name: p.propertyName, 
//         type: p.type, 
//         score: p.score.toFixed(2) 
//       }))
//     );
    
//     res.json(finalProperties);
//   } catch (error) {
//     console.error('Recommendations error:', error.message, error.stack);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Helper function to fetch all properties
// async function fetchAllProperties() {
//   const pgProperties = await PGProperty.find({ deletedAt: null });
//   const bhkProperties = await BHKHouse.find({ deletedAt: null });
//   const vacationProperties = await VacationSpot.find({ deletedAt: null });
  
//   return [
//     ...pgProperties.map(p => ({ ...p.toObject(), type: 'pg' })),
//     ...bhkProperties.map(p => ({ ...p.toObject(), type: 'bhk' })),
//     ...vacationProperties.map(p => ({ ...p.toObject(), type: 'vacation' })),
//   ];
// }

// // Property Listing Routes
// router.get('/pg', optionalAuth, async (req, res) => {
//   try {
//     const pgProperties = await PGProperty.find({ deletedAt: null });
//     if (req.user) {
//       const favorites = await Favorite.find({ user: req.user._id, propertyType: 'pg' });
//       const favoriteIds = new Set(favorites.map(fav => fav.propertyId.toString()));
//       pgProperties.forEach(prop => {
//         prop._doc.isFavorited = favoriteIds.has(prop._id.toString());
//       });
//     }
//     res.json(pgProperties);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// router.get('/bhk', optionalAuth, async (req, res) => {
//   try {
//     const bhkProperties = await BHKHouse.find({ deletedAt: null });
//     if (req.user) {
//       const favorites = await Favorite.find({ user: req.user._id, propertyType: 'bhk' });
//       const favoriteIds = new Set(favorites.map(fav => fav.propertyId.toString()));
//       bhkProperties.forEach(prop => {
//         prop._doc.isFavorited = favoriteIds.has(prop._id.toString());
//       });
//     }
//     res.json(bhkProperties);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// router.get('/vacation', optionalAuth, async (req, res) => {
//   try {
//     const vacationProperties = await VacationSpot.find({ deletedAt: null });
//     if (req.user) {
//       const favorites = await Favorite.find({ user: req.user._id, propertyType: 'vacation' });
//       const favoriteIds = new Set(favorites.map(fav => fav.propertyId.toString()));
//       vacationProperties.forEach(prop => {
//         prop._doc.isFavorited = favoriteIds.has(prop._id.toString());
//       });
//     }
//     res.json(vacationProperties);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// router.get('/my-properties', protect, async (req, res) => {
//   try {
//     const userId = req.user._id;
//     console.log('Fetching active properties for user:', userId);

//     const pgProperties = await PGProperty.find({ user: userId, deletedAt: null });
//     const bhkProperties = await BHKHouse.find({ user: userId, deletedAt: null });
//     const vacationProperties = await VacationSpot.find({ user: userId, deletedAt: null });

//     const properties = [
//       ...pgProperties.map(p => ({ ...p.toObject(), type: 'pg' })),
//       ...bhkProperties.map(p => ({ ...p.toObject(), type: 'bhk' })),
//       ...vacationProperties.map(p => ({ ...p.toObject(), type: 'vacation' })),
//     ];

//     console.log('Active user properties fetched:', properties);
//     res.json(properties);
//   } catch (error) {
//     console.error('Error fetching user properties:', error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// router.get('/my-properties/deleted', protect, async (req, res) => {
//   try {
//     const userId = req.user._id;
//     console.log('Fetching deleted properties for user:', userId);

//     const pgProperties = await PGProperty.find({ user: userId, deletedAt: { $ne: null } });
//     const bhkProperties = await BHKHouse.find({ user: userId, deletedAt: { $ne: null } });
//     const vacationProperties = await VacationSpot.find({ user: userId, deletedAt: { $ne: null } });

//     const properties = [
//       ...pgProperties.map(p => ({ ...p.toObject(), type: 'pg' })),
//       ...bhkProperties.map(p => ({ ...p.toObject(), type: 'bhk' })),
//       ...vacationProperties.map(p => ({ ...p.toObject(), type: 'vacation' })),
//     ];

//     console.log('Deleted user properties fetched:', properties);
//     res.json(properties);
//   } catch (error) {
//     console.error('Error fetching deleted properties:', error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Messages and Chats
// router.get('/:propertyId/messages', protect, async (req, res) => {
//   const { propertyId } = req.params;
//   const userId = req.user._id;
//   console.log('Fetching messages for propertyId:', propertyId, 'user:', userId);

//   if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//     console.log('Invalid propertyId:', propertyId);
//     return res.status(400).json({ message: 'Invalid property ID' });
//   }

//   try {
//     const messages = await Message.find({
//       propertyId,
//       $or: [
//         { sender: userId },
//         { recipient: userId },
//       ],
//     })
//       .populate('sender', 'username')
//       .populate('recipient', 'username')
//       .lean();

//     console.log('Messages found:', messages);
//     res.json(messages);
//   } catch (error) {
//     console.error('Error fetching messages:', error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// router.get('/chats', protect, async (req, res) => {
//   try {
//     const userId = req.user._id;
//     console.log('Fetching chats for user:', userId);

//     const messages = await Message.find({ $or: [{ sender: userId }, { recipient: userId }] })
//       .populate('sender', 'username')
//       .populate('recipient', 'username')
//       .lean();

//     const chats = {};

//     for (const msg of messages) {
//       const otherUserId = msg.sender._id.toString() === userId.toString()
//         ? msg.recipient._id.toString()
//         : msg.sender._id.toString();
//       const otherUsername = msg.sender._id.toString() === userId.toString()
//         ? msg.recipient.username
//         : msg.sender.username;
//       const convoKey = `${msg.propertyId}-${[userId.toString(), otherUserId].sort().join('-')}`;

//       let property;
//       switch (msg.propertyType) {
//         case 'pg':
//           property = await PGProperty.findById(msg.propertyId).select('propertyName images');
//           break;
//         case 'bhk':
//           property = await BHKHouse.findById(msg.propertyId).select('propertyName images');
//           break;
//         case 'vacation':
//           property = await VacationSpot.findById(msg.propertyId).select('propertyName images');
//           break;
//         default:
//           console.log(`Unknown propertyType for message ${msg._id}: ${msg.propertyType}`);
//           property = null;
//       }

//       if (!chats[convoKey]) {
//         chats[convoKey] = {
//           userId: otherUserId,
//           username: otherUsername,
//           lastMessage: msg.content,
//           lastTimestamp: msg.timestamp,
//           propertyId: msg.propertyId.toString(),
//           propertyName: property?.propertyName || 'Unknown Property',
//           imageUrl: property?.images?.[0] || 'https://placehold.co/50',
//           propertyType: msg.propertyType,
//           unreadCount: 0,
//         };
//       } else if (new Date(msg.timestamp) > new Date(chats[convoKey].lastTimestamp)) {
//         chats[convoKey].lastMessage = msg.content;
//         chats[convoKey].lastTimestamp = msg.timestamp;
//       }

//       if (!msg.isRead && msg.recipient._id.toString() === userId.toString()) {
//         chats[convoKey].unreadCount += 1;
//       }
//     }

//     const chatArray = Object.values(chats);
//     console.log('Chats fetched:', chatArray);
//     res.json(chatArray);
//   } catch (error) {
//     console.error('Error fetching chats:', error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// router.patch('/:propertyId/messages/mark-read', protect, async (req, res) => {
//   const { propertyId } = req.params;
//   const { otherUserId } = req.body;
//   const userId = req.user._id;

//   if (!mongoose.Types.ObjectId.isValid(propertyId) || !mongoose.Types.ObjectId.isValid(otherUserId)) {
//     return res.status(400).json({ message: 'Invalid property ID or user ID' });
//   }

//   try {
//     const result = await Message.updateMany(
//       {
//         propertyId,
//         sender: otherUserId,
//         recipient: userId,
//         isRead: false,
//       },
//       { $set: { isRead: true } }
//     );
//     console.log(`Marked ${result.modifiedCount} messages as read for user ${userId} from ${otherUserId} on property ${propertyId}`);
//     res.json({ success: true, modifiedCount: result.modifiedCount });
//   } catch (error) {
//     console.error('Error marking messages as read:', error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// router.get('/chats/unread', protect, async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const unreadCount = await Message.countDocuments({
//       recipient: userId,
//       isRead: false,
//     });
//     console.log(`Total unread messages for user ${userId}: ${unreadCount}`);
//     res.json({ totalUnread: unreadCount });
//   } catch (error) {
//     console.error('Error fetching unread count:', error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Property Details, Edit, Delete
// router.get('/:type/:propertyId', optionalAuth, async (req, res) => {
//   const { type, propertyId } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//     return res.status(400).json({ message: 'Invalid property ID' });
//   }

//   try {
//     let property;
//     if (type === 'pg') property = await PGProperty.findById(propertyId);
//     else if (type === 'bhk') property = await BHKHouse.findById(propertyId);
//     else if (type === 'vacation') property = await VacationSpot.findById(propertyId);
//     else return res.status(400).json({ message: 'Invalid property type' });

//     if (!property || property.deletedAt) {
//       return res.status(404).json({ message: 'Property not found or deleted' });
//     }

//     if (type === 'vacation') {
//       const sixMonthsAgo = new Date();
//       sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
//       const recentBookings = property.bookings.filter(
//         (booking) => new Date(booking.createdAt) >= sixMonthsAgo
//       );
//       const bookingsLast6Months = recentBookings.reduce(
//         (sum, booking) => sum + (booking.numGuests || 0),
//         0
//       );
//       property = property.toObject();
//       property.bookingsLast6Months = bookingsLast6Months;
//     }

//     res.json(property);
//   } catch (error) {
//     console.error('Error fetching property:', error.message, error.stack);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// router.put('/:type/:propertyId', protect, async (req, res) => {
//   const { type, propertyId } = req.params;
//   const userId = req.user._id;
//   const updates = req.body;

//   try {
//     if (!['pg', 'bhk', 'vacation'].includes(type)) {
//       return res.status(400).json({ message: 'Invalid property type' });
//     }

//     let Model;
//     if (type === 'pg') Model = PGProperty;
//     else if (type === 'bhk') Model = BHKHouse;
//     else Model = VacationSpot;

//     const property = await Model.findOne({ _id: propertyId, user: userId, deletedAt: null });
//     if (!property) {
//       return res.status(404).json({ message: 'Property not found or not yours' });
//     }

//     delete updates.user;
//     delete updates.deletedAt;

//     Object.assign(property, updates);
//     await property.save();
//     console.log(`Property ${propertyId} updated by user ${userId} with updates:`, updates);
//     res.json(property);
//   } catch (error) {
//     console.error('Error updating property:', error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// router.delete('/:type/:propertyId', protect, async (req, res) => {
//   const { type, propertyId } = req.params;
//   const userId = req.user._id;

//   try {
//     if (!['pg', 'bhk', 'vacation'].includes(type)) {
//       return res.status(400).json({ message: 'Invalid property type' });
//     }

//     let Model;
//     if (type === 'pg') Model = PGProperty;
//     else if (type === 'bhk') Model = BHKHouse;
//     else Model = VacationSpot;

//     const property = await Model.findOne({ _id: propertyId, user: userId, deletedAt: null });
//     if (!property) {
//       return res.status(404).json({ message: 'Property not found or not yours' });
//     }

//     property.deletedAt = new Date();
//     await property.save();
//     console.log(`Property ${propertyId} soft deleted by user ${userId}`);
//     res.json({ message: 'Property deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting property:', error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Vacation Review Route
// router.post('/vacation/:propertyId/review', protect, async (req, res) => {
//   const { propertyId } = req.params;
//   const { rating, review } = req.body;
//   const userId = req.user.id;

//   console.log('Review request:', { propertyId, rating, review, userId });

//   if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//     console.log('Invalid propertyId:', propertyId);
//     return res.status(400).json({ message: 'Invalid property ID' });
//   }

//   if (!rating || rating < 1 || rating > 5) {
//     console.log('Invalid rating:', rating);
//     return res.status(400).json({ message: 'Rating must be between 1 and 5' });
//   }

//   try {
//     const property = await VacationSpot.findById(propertyId);
//     if (!property || property.deletedAt) {
//       console.log('Property not found or deleted:', propertyId);
//       return res.status(404).json({ message: 'Property not found or deleted' });
//     }

//     property.reviews = property.reviews || [];
//     property.reviews.push({ user: userId, rating, review, date: new Date() });

//     const totalRating = property.reviews.reduce((sum, r) => sum + r.rating, 0);
//     property.rating = totalRating / property.reviews.length;
//     property.reviewsCount = property.reviews.length;

//     await property.save();
//     console.log(`Review added to ${property.propertyName} by user ${userId}`);

//     res.json({ message: 'Review submitted successfully' });
//   } catch (error) {
//     console.error('Review submission error:', error.message, error.stack);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// module.exports = router;