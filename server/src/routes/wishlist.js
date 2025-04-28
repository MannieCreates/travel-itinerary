import express from 'express';
import Wishlist from '../models/Wishlist.js';
import Tour from '../models/Tour.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.userId }).populate({
      path: 'tours',
      select: 'title images price duration category rating totalReviews destination'
    });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.userId, tours: [] });
      await wishlist.save();
    }

    res.json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
});

// Add tour to wishlist
router.post('/add/:tourId', auth, async (req, res) => {
  try {
    const { tourId } = req.params;

    // Validate tour exists
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.userId, tours: [] });
    }

    // Check if tour already in wishlist
    if (!wishlist.tours.includes(tourId)) {
      wishlist.tours.push(tourId);
      await wishlist.save();
    }
    
    // Populate tour details before sending response
    await wishlist.populate({
      path: 'tours',
      select: 'title images price duration category rating totalReviews destination'
    });

    res.status(201).json(wishlist);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Error adding to wishlist' });
  }
});

// Remove tour from wishlist
router.delete('/remove/:tourId', auth, async (req, res) => {
  try {
    const { tourId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.tours = wishlist.tours.filter(tour => tour.toString() !== tourId);
    await wishlist.save();
    
    await wishlist.populate({
      path: 'tours',
      select: 'title images price duration category rating totalReviews destination'
    });

    res.json(wishlist);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Error removing from wishlist' });
  }
});

// Clear wishlist
router.delete('/clear', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.tours = [];
    await wishlist.save();

    res.json({ message: 'Wishlist cleared successfully' });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ message: 'Error clearing wishlist' });
  }
});

// Check if a tour is in the wishlist
router.get('/check/:tourId', auth, async (req, res) => {
  try {
    const { tourId } = req.params;
    
    const wishlist = await Wishlist.findOne({ user: req.userId });
    if (!wishlist) {
      return res.json({ inWishlist: false });
    }
    
    const inWishlist = wishlist.tours.some(tour => tour.toString() === tourId);
    res.json({ inWishlist });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({ message: 'Error checking wishlist' });
  }
});

export default router;
