import express from 'express';
import Tour from '../models/Tour.js';
import mongoose from 'mongoose';

const router = express.Router();

// Search tours
router.get('/search', async (req, res) => {
  try {
    const {
      destination,
      startDate,
      endDate,
      category,
      minPrice,
      maxPrice,
      duration
    } = req.query;

    // Build query
    const query = {};

    // Destination search (case-insensitive)
    if (destination) {
      query.destination = new RegExp(destination, 'i');
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Date range filter
    if (startDate || endDate) {
      query['startDates.date'] = {};
      if (startDate) {
        query['startDates.date'].$gte = new Date(startDate);
      }
      if (endDate) {
        query['startDates.date'].$lte = new Date(endDate);
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query['price.amount'] = {};
      if (minPrice) {
        query['price.amount'].$gte = Number(minPrice);
      }
      if (maxPrice) {
        query['price.amount'].$lte = Number(maxPrice);
      }
    }

    // Duration filter
    if (duration) {
      query.duration = Number(duration);
    }

    // Execute query with available seats check
    const tours = await Tour.find(query)
      .select('-__v')
      .sort({ 'price.amount': 1 }); // Sort by price ascending by default

    // Filter out tours with no available seats if date is specified
    const availableTours = startDate
      ? tours.filter(tour => {
          const availableDates = tour.startDates.filter(
            date => date.date >= new Date(startDate) && date.availableSeats > 0
          );
          return availableDates.length > 0;
        })
      : tours;

    res.json({
      count: availableTours.length,
      tours: availableTours
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error searching tours' });
  }
});

// Get tour by ID
router.get('/:id', async (req, res) => {
  try {
    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid tour ID format' });
    }

    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json(tour);
  } catch (error) {
    console.error('Error fetching tour:', error);
    res.status(500).json({ message: 'Error fetching tour' });
  }
});

// Get availability for a specific tour
router.get('/:id/availability', async (req, res) => {
  try {
    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid tour ID format' });
    }

    const tour = await Tour.findById(req.params.id).select('startDates');
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Return only the availability data
    res.json({
      tourId: tour._id,
      startDates: tour.startDates.map(date => ({
        date: date.date,
        availableSeats: date.availableSeats,
        totalSeats: date.totalSeats
      }))
    });
  } catch (error) {
    console.error('Error fetching tour availability:', error);
    res.status(500).json({ message: 'Error fetching tour availability' });
  }
});

export default router;