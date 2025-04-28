import express from 'express';
import Review from '../models/Review.js';
import Tour from '../models/Tour.js';
import Booking from '../models/Booking.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all reviews for a tour
router.get('/tour/:tourId', async (req, res) => {
  try {
    const { tourId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const reviews = await Review.find({ tour: tourId })
      .populate({
        path: 'user',
        select: 'username'
      })
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Review.countDocuments({ tour: tourId });

    res.json({
      reviews,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// Get a specific review
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate({
      path: 'user',
      select: 'username'
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching review', error: error.message });
  }
});

// Create a new review
router.post('/', auth, async (req, res) => {
  try {
    const { tourId, rating, title, comment, images } = req.body;

    if (!tourId || !rating || !title || !comment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate tour exists
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Check if user has booked and completed this tour
    const booking = await Booking.findOne({
      user: req.userId,
      tour: tourId,
      status: 'completed'
    });

    if (!booking) {
      return res.status(403).json({ message: 'You can only review tours you have completed' });
    }

    // Check if user has already reviewed this tour
    const existingReview = await Review.findOne({
      user: req.userId,
      tour: tourId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this tour' });
    }

    // Create new review
    const review = new Review({
      user: req.userId,
      tour: tourId,
      rating,
      title,
      comment,
      images: images || []
    });

    await review.save();

    // Return the review with user details
    const populatedReview = await Review.findById(review._id).populate({
      path: 'user',
      select: 'username'
    });

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
});

// Update a review
router.put('/:id', auth, async (req, res) => {
  try {
    const { rating, title, comment, images } = req.body;
    const { id } = req.params;

    if (!rating && !title && !comment && !images) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    // Find the review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (images) review.images = images;

    review.updatedAt = Date.now();
    await review.save();

    // Return the updated review with user details
    const updatedReview = await Review.findById(id).populate({
      path: 'user',
      select: 'username'
    });

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
});

// Delete a review
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

// Get user's reviews
router.get('/user/me', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.userId })
      .populate({
        path: 'tour',
        select: 'title destination images'
      })
      .sort('-createdAt');

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user reviews', error: error.message });
  }
});

export default router;
