import express from 'express';
import Coupon from '../models/Coupon.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Validate a coupon code
router.post('/validate', auth, async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ message: 'Coupon is expired or inactive' });
    }

    if (subtotal && subtotal < coupon.minPurchase) {
      return res.status(400).json({
        message: `Minimum purchase amount of ${coupon.minPurchase} required`,
        minPurchase: coupon.minPurchase
      });
    }

    const discount = subtotal ? coupon.calculateDiscount(subtotal) : null;

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minPurchase: coupon.minPurchase,
        maxDiscount: coupon.maxDiscount,
        validUntil: coupon.validUntil
      },
      discount,
      message: 'Coupon is valid'
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ message: 'Error validating coupon' });
  }
});

// Apply a coupon to calculate discount
router.post('/apply', auth, async (req, res) => {
  try {
    const { code, subtotal, items } = req.body;

    if (!code || !subtotal) {
      return res.status(400).json({ message: 'Coupon code and subtotal are required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ message: 'Coupon is expired or inactive' });
    }

    if (subtotal < coupon.minPurchase) {
      return res.status(400).json({
        message: `Minimum purchase amount of ${coupon.minPurchase} required`,
        minPurchase: coupon.minPurchase
      });
    }

    // Check if coupon is applicable to the items
    if (coupon.applicableTours && coupon.applicableTours.length > 0 && items) {
      const tourIds = items.map(item => item.tourId.toString());
      const applicableTourIds = coupon.applicableTours.map(tour => tour.toString());

      const hasApplicableTour = tourIds.some(id => applicableTourIds.includes(id));

      if (!hasApplicableTour) {
        return res.status(400).json({ message: 'Coupon is not applicable to the selected tours' });
      }
    }

    const discount = coupon.calculateDiscount(subtotal);

    // Increment usage count
    coupon.usageCount += 1;
    await coupon.save();

    res.json({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      subtotalAfterDiscount: subtotal - discount,
      message: 'Coupon applied successfully'
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ message: 'Error applying coupon' });
  }
});

// List all coupons with pagination
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    // In a real application, you would check if the user is an admin
    // For now, we'll just return all coupons with pagination
    const coupons = await Coupon.find()
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('applicableTours', 'title');

    const total = await Coupon.countDocuments();

    res.json({
      coupons,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ message: 'Error fetching coupons' });
  }
});

// List all active coupons (admin only)
router.get('/admin', auth, async (req, res) => {
  try {
    // In a real application, you would check if the user is an admin
    // For now, we'll just return all coupons
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ message: 'Error fetching coupons' });
  }
});

// Create a new coupon (admin only)
router.post('/admin', auth, async (req, res) => {
  try {
    // In a real application, you would check if the user is an admin
    const {
      code,
      type,
      value,
      minPurchase,
      maxDiscount,
      validFrom,
      validUntil,
      usageLimit,
      applicableTours
    } = req.body;

    // Validate required fields
    if (!code || !type || value === undefined || !validUntil) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      type,
      value,
      minPurchase: minPurchase || 0,
      maxDiscount: maxDiscount || null,
      validFrom: validFrom || new Date(),
      validUntil: new Date(validUntil),
      usageLimit: usageLimit || null,
      applicableTours: applicableTours || []
    });

    await coupon.save();

    res.status(201).json({
      coupon,
      message: 'Coupon created successfully'
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ message: 'Error creating coupon' });
  }
});

// Update a coupon (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    // In a real application, you would check if the user is an admin
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const {
      type,
      value,
      minPurchase,
      maxDiscount,
      validFrom,
      validUntil,
      usageLimit,
      isActive,
      applicableTours
    } = req.body;

    // Update fields if provided
    if (type) coupon.type = type;
    if (value !== undefined) coupon.value = value;
    if (minPurchase !== undefined) coupon.minPurchase = minPurchase;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (validFrom) coupon.validFrom = new Date(validFrom);
    if (validUntil) coupon.validUntil = new Date(validUntil);
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (applicableTours) coupon.applicableTours = applicableTours;

    await coupon.save();

    res.json({
      coupon,
      message: 'Coupon updated successfully'
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ message: 'Error updating coupon' });
  }
});

// Delete a coupon (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // In a real application, you would check if the user is an admin
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await coupon.deleteOne();

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ message: 'Error deleting coupon' });
  }
});

export default router;
