import express from 'express';
import User from '../models/User.js';
import Tour from '../models/Tour.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Payment from '../models/Payment.js';
import BlogPost from '../models/BlogPost.js';
import Notification from '../models/Notification.js';
import { auth } from '../middleware/auth.js';
import { sendBookingStatusUpdate } from '../utils/emailService.js';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking admin status', error: error.message });
  }
};

// Get dashboard statistics
router.get('/dashboard', auth, isAdmin, async (req, res) => {
  try {
    // Get counts
    const userCount = await User.countDocuments();
    const tourCount = await Tour.countDocuments();
    const bookingCount = await Booking.countDocuments();
    const reviewCount = await Review.countDocuments();

    // Get recent bookings
    const recentBookings = await Booking.find()
      .sort('-createdAt')
      .limit(5)
      .populate({
        path: 'user',
        select: 'username email'
      })
      .populate({
        path: 'tour',
        select: 'title destination'
      });

    // Get revenue statistics
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get monthly revenue for the current year
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format monthly revenue
    const monthlyRevenueData = Array(12).fill(0);
    monthlyRevenue.forEach(item => {
      monthlyRevenueData[item._id - 1] = item.revenue;
    });

    // Get top tours by bookings
    const topTours = await Booking.aggregate([
      { $group: { _id: '$tour', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const topToursWithDetails = await Tour.find({
      _id: { $in: topTours.map(t => t._id) }
    }).select('title destination');

    // Combine tour details with booking counts
    const topToursData = topToursWithDetails.map(tour => {
      const bookingData = topTours.find(t => t._id.toString() === tour._id.toString());
      return {
        _id: tour._id,
        title: tour.title,
        destination: tour.destination,
        bookings: bookingData ? bookingData.count : 0
      };
    }).sort((a, b) => b.bookings - a.bookings);

    res.json({
      counts: {
        users: userCount,
        tours: tourCount,
        bookings: bookingCount,
        reviews: reviewCount
      },
      revenue: {
        total: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        monthly: monthlyRevenueData
      },
      recentBookings,
      topTours: topToursData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
});

// Get all users (admin only)
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', search } = req.query;

    // Build query
    let query = {};
    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Update user (admin only)
router.put('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Get all bookings (admin only)
router.get('/bookings', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', status } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate({
        path: 'user',
        select: 'username email'
      })
      .populate({
        path: 'tour',
        select: 'title destination'
      })
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Update booking (admin only)
router.put('/bookings/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Store old status for notification
    const oldStatus = booking.status;
    const statusChanged = status && status !== oldStatus;

    // Update booking fields
    if (status) booking.status = status;
    if (notes !== undefined) booking.notes = notes;
    booking.updatedAt = new Date();

    await booking.save();

    // Return booking with populated fields
    const updatedBooking = await Booking.findById(id)
      .populate({
        path: 'user',
        select: 'username email'
      })
      .populate({
        path: 'tour',
        select: 'title destination'
      });

    // Create notification if status changed
    if (statusChanged) {
      const notification = new Notification({
        user: booking.user,
        type: 'booking_update',
        title: 'Booking Status Updated',
        message: `Your booking status has been updated from ${oldStatus} to ${status}.`,
        relatedTo: {
          model: 'Booking',
          id: booking._id
        }
      });

      await notification.save();

      // Send email notification
      try {
        const user = await User.findById(booking.user);
        const tour = await Tour.findById(booking.tour);

        await sendBookingStatusUpdate(booking, user, tour, oldStatus);
        console.log('Booking status update email sent successfully');
      } catch (emailError) {
        console.error('Error sending booking status update email:', emailError);
        // Don't fail the status update if email fails
      }
    }

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking', error: error.message });
  }
});

// Update booking status (admin only)
router.put('/bookings/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Store old status for notification
    const oldStatus = booking.status;

    // Update booking status
    booking.status = status;
    await booking.save();

    // Return booking with populated fields
    const updatedBooking = await Booking.findById(id)
      .populate({
        path: 'user',
        select: 'username email'
      })
      .populate({
        path: 'tour',
        select: 'title destination'
      });

    // Create notification
    const notification = new Notification({
      user: booking.user,
      type: 'booking_update',
      title: 'Booking Status Updated',
      message: `Your booking status has been updated from ${oldStatus} to ${status}.`,
      relatedTo: {
        model: 'Booking',
        id: booking._id
      }
    });

    await notification.save();

    // Send email notification
    try {
      const user = await User.findById(booking.user);
      const tour = await Tour.findById(booking.tour);

      await sendBookingStatusUpdate(booking, user, tour, oldStatus);
      console.log('Booking status update email sent successfully');
    } catch (emailError) {
      console.error('Error sending booking status update email:', emailError);
      // Don't fail the status update if email fails
    }

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status', error: error.message });
  }
});

// Get all payments (admin only)
router.get('/payments', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', status } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate({
        path: 'user',
        select: 'username email'
      })
      .populate({
        path: 'booking',
        select: 'tour startDate status',
        populate: {
          path: 'tour',
          select: 'title destination'
        }
      })
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

// Process refund (admin only)
router.post('/payments/:id/refund', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    if (!amount || !reason) {
      return res.status(400).json({ message: 'Amount and reason are required' });
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed payments can be refunded' });
    }

    if (amount > payment.amount) {
      return res.status(400).json({ message: 'Refund amount cannot exceed payment amount' });
    }

    // Process refund
    payment.status = 'refunded';
    payment.refundAmount = amount;
    payment.refundReason = reason;
    payment.refundDate = new Date();
    payment.updatedAt = new Date();
    await payment.save();

    // Update booking status
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      const oldStatus = booking.status;
      booking.status = 'cancelled';
      await booking.save();

      // Create notification
      const notification = new Notification({
        user: payment.user,
        type: 'payment_refund',
        title: 'Payment Refunded',
        message: `Your payment of ${amount} ${payment.currency} has been refunded. Reason: ${reason}`,
        relatedTo: {
          model: 'Payment',
          id: payment._id
        }
      });

      await notification.save();

      // Send email notification
      try {
        const user = await User.findById(payment.user);
        const tour = await Tour.findById(booking.tour);

        await sendBookingStatusUpdate(booking, user, tour, oldStatus);
        console.log('Refund notification email sent successfully');
      } catch (emailError) {
        console.error('Error sending refund notification email:', emailError);
        // Don't fail the refund if email fails
      }
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error processing refund', error: error.message });
  }
});

// Get all blog posts (admin only)
router.get('/blog', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', status } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;

    const posts = await BlogPost.find(query)
      .populate({
        path: 'author',
        select: 'username email'
      })
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await BlogPost.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog posts', error: error.message });
  }
});

// Update blog post status (admin only)
router.put('/blog/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    post.status = status;
    if (status === 'published' && !post.publishedAt) {
      post.publishedAt = new Date();
    }
    post.updatedAt = new Date();
    await post.save();

    // Return post with populated fields
    const updatedPost = await BlogPost.findById(id)
      .populate({
        path: 'author',
        select: 'username email'
      });

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error updating blog post status', error: error.message });
  }
});

// Create a new tour (admin only)
router.post('/tours', auth, isAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      destination,
      duration,
      price,
      category,
      inclusions,
      startDates
    } = req.body;

    // Validate required fields
    if (!title || !description || !destination || !duration || !price || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create new tour
    const tour = new Tour({
      title,
      description,
      destination,
      duration,
      price,
      category,
      inclusions: inclusions || [],
      startDates: startDates || [],
      location: {
        // Default coordinates if not provided
        coordinates: [-74.0060, 40.7128] // New York City
      }
    });

    await tour.save();
    res.status(201).json(tour);
  } catch (error) {
    res.status(500).json({ message: 'Error creating tour', error: error.message });
  }
});

// Update a tour (admin only)
router.put('/tours/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      destination,
      duration,
      price,
      category,
      inclusions,
      startDates
    } = req.body;

    const tour = await Tour.findById(id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Update fields
    if (title) tour.title = title;
    if (description) tour.description = description;
    if (destination) tour.destination = destination;
    if (duration) tour.duration = duration;
    if (price) tour.price = price;
    if (category) tour.category = category;
    if (inclusions) tour.inclusions = inclusions;
    if (startDates) tour.startDates = startDates;

    await tour.save();
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: 'Error updating tour', error: error.message });
  }
});

// Delete a tour (admin only)
router.delete('/tours/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const tour = await Tour.findById(id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Check if there are any bookings for this tour
    const bookingsCount = await Booking.countDocuments({ tour: id });
    if (bookingsCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete tour with existing bookings. Consider making it unavailable instead.'
      });
    }

    await Tour.findByIdAndDelete(id);
    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tour', error: error.message });
  }
});

export default router;
