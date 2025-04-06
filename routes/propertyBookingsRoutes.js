const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');
const VacationSpot = require('../models/VacationSpot');
const Notification = require('../models/Notification');

// My Bookings Route
router.get('/my-bookings/vacation', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching vacation bookings for user:', userId);

    const vacationSpots = await VacationSpot.find({
      'bookings.user': userId,
    }).lean();

    const bookings = vacationSpots.flatMap(spot =>
      (spot.bookings || []).filter(booking => booking.user.toString() === userId).map(booking => ({
        propertyId: spot._id,
        propertyName: spot.propertyName,
        address: spot.address,
        startDate: booking.startDate,
        endDate: booking.endDate,
        ratePerDay: spot.ratePerDay,
      }))
    );

    console.log('Vacation bookings fetched:', bookings);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching vacation bookings:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Bookings for a Specific Property
router.get('/:propertyId/bookings', optionalAuth, async (req, res) => {
  const { propertyId } = req.params;

  console.log('Fetching bookings for propertyId:', propertyId);

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    console.log('Invalid propertyId:', propertyId);
    return res.status(400).json({ message: 'Invalid property ID' });
  }

  try {
    const property = await VacationSpot.findById(propertyId);
    if (!property || property.deletedAt) {
      console.log('Property not found or deleted:', propertyId);
      return res.status(404).json({ message: 'Property not found or deleted' });
    }

    const bookings = (property.bookings || []).map(booking => ({
      startDate: booking.startDate,
      endDate: booking.endDate,
      user: booking.user.toString(),
    }));

    console.log('Bookings fetched:', bookings);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Booking Route
router.post('/:propertyId/book', protect, async (req, res) => {
  const { propertyId } = req.params;
  const { startDate, endDate, numGuests } = req.body;
  const userId = req.user.id;

  console.log('Booking request:', { propertyId, startDate, endDate, numGuests, userId });

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    console.log('Invalid propertyId:', propertyId);
    return res.status(400).json({ message: 'Invalid property ID' });
  }

  if (!numGuests || numGuests < 1) {
    return res.status(400).json({ message: 'Number of guests must be at least 1' });
  }

  try {
    console.log('Fetching property:', propertyId);
    const property = await VacationSpot.findById(propertyId);
    if (!property || property.deletedAt) {
      console.log('Property not found or deleted:', propertyId);
      return res.status(404).json({ message: 'Property not found or deleted' });
    }

    console.log('Property found:', property.propertyName);
    if (numGuests > property.maxGuests) {
      return res.status(400).json({ message: `Number of guests exceeds max capacity (${property.maxGuests})` });
    }

    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    console.log('Checking overlap:', { newStart, newEnd });
    const isOverlap = property.bookings.some(booking => {
      const existingStart = new Date(booking.startDate);
      const existingEnd = new Date(booking.endDate);
      return (newStart <= existingEnd && newEnd >= existingStart);
    });

    if (isOverlap) {
      console.log('Booking overlap detected:', { startDate, endDate });
      return res.status(400).json({ message: 'Dates already booked' });
    }

    console.log('Adding booking...');
    property.bookings.push({ startDate, endDate, user: userId, reviewPrompted: false, numGuests });
    await property.save();
    console.log('Booking saved');

    console.log('Saving notification...');
    const notification = new Notification({
      user: userId,
      message: `Booking for ${property.propertyName} successful!`,
      type: 'success',
      propertyId,
      propertyType: 'VacationSpot',
    });
    await notification.save();
    console.log('Notification saved');

    console.log('Emitting socket event...');
    req.io.to(userId).emit('bookingSuccess', {
      propertyId,
      propertyName: property.propertyName,
    });

    res.json({ message: 'Booking saved', booking: { startDate, endDate, numGuests } });
  } catch (error) {
    console.error('Booking error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;