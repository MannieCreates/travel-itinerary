import express from 'express';
import Cart from '../models/Cart.js';
import Tour from '../models/Tour.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.userId }).populate({
      path: 'items.tour',
      select: 'title images price duration category'
    });

    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { tourId, startDate, travelers } = req.body;

    if (!tourId || !startDate || !travelers) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate tour exists
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Validate start date is available
    const selectedDate = tour.startDates.find(
      date => new Date(date.date).toISOString().split('T')[0] === startDate
    );

    if (!selectedDate) {
      return res.status(400).json({ message: 'Selected date is not available' });
    }

    if (selectedDate.availableSeats < travelers) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
    }

    // Check if tour already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.tour.toString() === tourId && new Date(item.startDate).toISOString().split('T')[0] === startDate
    );

    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].travelers = travelers;
    } else {
      // Add new item
      cart.items.push({
        tour: tourId,
        startDate: new Date(startDate),
        travelers,
        price: tour.price
      });
    }

    await cart.save();

    // Populate tour details before sending response
    await cart.populate({
      path: 'items.tour',
      select: 'title images price duration category'
    });

    res.status(201).json(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Error adding to cart' });
  }
});

// Update cart item
router.put('/update/:itemId', auth, async (req, res) => {
  try {
    const { travelers } = req.body;
    const { itemId } = req.params;

    console.log('Update cart item request:');
    console.log('Item ID:', itemId);
    console.log('Travelers:', travelers);
    console.log('User ID:', req.userId);
    console.log('Auth token present:', !!req.headers.authorization);

    if (!travelers) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get the cart first, create if it doesn't exist
    let cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      console.log('Cart not found for user, creating new cart:', req.userId);
      cart = new Cart({ user: req.userId, items: [] });
      await cart.save();
      return res.json(cart); // Return empty cart since there's nothing to update
    }

    console.log('Cart found:', cart._id);
    console.log('Cart items before update:', JSON.stringify(cart.items, null, 2));

    // Find the item in the cart using string comparison
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {
      console.log('Item not found in cart. Item ID:', itemId);
      // Instead of returning an error, just return the current cart
      // This prevents errors when the item is already removed
      return res.json(cart);
    }

    const item = cart.items[itemIndex];
    console.log('Item found at index:', itemIndex, 'with ID:', item._id.toString());

    // Make a copy of the cart items to avoid reference issues
    const updatedItems = [...cart.items];

    // Update the travelers count directly in the copied array
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      travelers: travelers
    };

    // Replace the cart items with the updated array
    cart.items = updatedItems;

    console.log('Cart items after update (before save):', JSON.stringify(cart.items, null, 2));

    // Save the updated cart
    await cart.save();

    console.log('Cart items after save:', JSON.stringify(cart.items, null, 2));
    console.log('Cart updated successfully');

    // Populate tour details before sending response
    await cart.populate({
      path: 'items.tour',
      select: 'title images price duration category'
    });

    res.json(cart);
  } catch (error) {
    console.error('Error updating cart:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Error updating cart' });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;

    console.log('Remove cart item request:');
    console.log('Item ID:', itemId);
    console.log('User ID:', req.userId);
    console.log('Auth token present:', !!req.headers.authorization);

    // Get the cart first, create if it doesn't exist
    let cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      console.log('Cart not found for user, creating new cart:', req.userId);
      cart = new Cart({ user: req.userId, items: [] });
      await cart.save();
      return res.json(cart); // Return empty cart since there's nothing to remove
    }

    console.log('Cart found:', cart._id);
    console.log('Cart items before removal:', cart.items.map(item => ({
      id: item._id.toString(),
      tour: item.tour.toString(),
      travelers: item.travelers
    })));

    // Find the item in the cart using string comparison
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {
      console.log('Item not found in cart. Item ID:', itemId);
      // Instead of returning an error, just return the current cart
      // This prevents errors when the item is already removed
      return res.json(cart);
    }

    // Remove the item from the cart
    cart.items.splice(itemIndex, 1);
    await cart.save();

    console.log('Item removed successfully');
    console.log('Cart items after removal:', cart.items.map(item => ({
      id: item._id.toString(),
      tour: item.tour.toString(),
      travelers: item.travelers
    })));

    // Populate tour details before sending response
    await cart.populate({
      path: 'items.tour',
      select: 'title images price duration category'
    });

    res.json(cart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Error removing from cart' });
  }
});

// Clear cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    cart.couponCode = null;
    await cart.save();

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Error clearing cart' });
  }
});

// Apply coupon to cart
router.post('/apply-coupon', auth, async (req, res) => {
  try {
    const { couponCode } = req.body;

    if (!couponCode) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // In a real application, you would validate the coupon here
    // For now, we'll just set the coupon code
    cart.couponCode = couponCode;
    await cart.save();

    await cart.populate({
      path: 'items.tour',
      select: 'title images price duration category'
    });

    res.json(cart);
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ message: 'Error applying coupon' });
  }
});

export default router;
