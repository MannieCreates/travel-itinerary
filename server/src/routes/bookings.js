import express from 'express';
import Booking from '../models/Booking.js';
import Tour from '../models/Tour.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import Notification from '../models/Notification.js';
import { auth } from '../middleware/auth.js';
import { sendBookingConfirmation, sendBookingStatusUpdate } from '../utils/emailService.js';

const router = express.Router();

// Get all bookings for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId })
      .populate({
        path: 'tour',
        select: 'title images destination duration category'
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Get all bookings for the authenticated user (alternative route)
router.get('/user', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId })
      .populate({
        path: 'tour',
        select: 'title images destination duration category'
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Error fetching user bookings' });
  }
});

// Get completed bookings for the authenticated user
router.get('/completed', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.userId,
      status: 'completed'
    })
      .populate({
        path: 'tour',
        select: 'title images destination duration category _id'
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching completed bookings:', error);
    res.status(500).json({ message: 'Error fetching completed bookings' });
  }
});

// Get a specific booking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'tour',
        select: 'title description images destination duration category itinerary inclusions price startDates'
      })
      .populate({
        path: 'user',
        select: 'username email'
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the booking belongs to the authenticated user
    if (booking.user._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Error fetching booking' });
  }
});

// Create a new booking
router.post('/', auth, async (req, res) => {
  try {
    const {
      tourId,
      startDate,
      travelers,
      contactInfo,
      specialRequests,
      paymentMethod
    } = req.body;

    // Validate required fields
    if (!tourId || !startDate || !travelers || !contactInfo) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate tour exists
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Validate start date is available
    const selectedDateIndex = tour.startDates.findIndex(
      date => new Date(date.date).toISOString().split('T')[0] === startDate
    );

    if (selectedDateIndex === -1) {
      return res.status(400).json({ message: 'Selected date is not available' });
    }

    const selectedDate = tour.startDates[selectedDateIndex];
    if (selectedDate.availableSeats < travelers) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    // Calculate total price
    const totalPrice = tour.price.amount * travelers;

    // Create booking
    const booking = new Booking({
      user: req.userId,
      tour: tourId,
      startDate: new Date(startDate),
      endDate: new Date(new Date(startDate).getTime() + tour.duration * 24 * 60 * 60 * 1000),
      travelers,
      totalPrice,
      currency: tour.price.currency,
      contactInfo,
      specialRequests,
      status: 'pending'
    });

    await booking.save();

    // Update tour availability
    tour.startDates[selectedDateIndex].availableSeats -= travelers;
    await tour.save();

    // Create payment record
    const payment = new Payment({
      booking: booking._id,
      user: req.userId,
      amount: totalPrice,
      currency: tour.price.currency,
      paymentMethod,
      status: 'pending'
    });

    await payment.save();

    // Create invoice
    const invoice = new Invoice({
      booking: booking._id,
      user: req.userId,
      items: [{
        tour: tourId,
        description: `${tour.title} - ${travelers} traveler(s)`,
        quantity: travelers,
        unitPrice: tour.price.amount,
        totalPrice
      }],
      subtotal: totalPrice,
      tax: totalPrice * 0.1, // 10% tax
      total: totalPrice * 1.1,
      currency: tour.price.currency,
      paymentMethod,
      paymentStatus: 'pending',
      billingAddress: contactInfo,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Due in 7 days
    });

    await invoice.save();

    // Create notification
    const notification = new Notification({
      user: req.userId,
      type: 'booking_confirmation',
      title: 'Booking Confirmation',
      message: `Your booking for ${tour.title} has been confirmed. Your booking ID is ${booking._id}.`,
      relatedTo: {
        model: 'Booking',
        id: booking._id
      }
    });

    await notification.save();

    // Clear cart if booking was made from cart
    if (req.body.fromCart) {
      const cart = await Cart.findOne({ user: req.userId });
      if (cart) {
        cart.items = cart.items.filter(item => item.tour.toString() !== tourId);
        await cart.save();
      }
    }

    // Populate tour details before sending response
    await booking.populate({
      path: 'tour',
      select: 'title images destination duration category'
    });

    // Get user details for email
    const user = await User.findById(req.userId);

    // Send booking confirmation email
    try {
      await sendBookingConfirmation(booking, user, tour);
      console.log('Booking confirmation email sent successfully');
    } catch (emailError) {
      console.error('Error sending booking confirmation email:', emailError);
      // Don't fail the booking creation if email fails
    }

    res.status(201).json({
      booking,
      payment,
      invoice,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

// Cancel a booking
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the booking belongs to the authenticated user
    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Completed bookings cannot be cancelled' });
    }

    // Calculate cancellation fee based on how close to the start date
    const today = new Date();
    const startDate = new Date(booking.startDate);
    const daysUntilStart = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));

    let refundPercentage = 0;
    if (daysUntilStart > 30) {
      refundPercentage = 90; // 10% fee
    } else if (daysUntilStart > 14) {
      refundPercentage = 70; // 30% fee
    } else if (daysUntilStart > 7) {
      refundPercentage = 50; // 50% fee
    } else if (daysUntilStart > 3) {
      refundPercentage = 25; // 75% fee
    } else {
      refundPercentage = 0; // 100% fee (no refund)
    }

    const refundAmount = (booking.totalPrice.amount * refundPercentage) / 100;

    // Update booking status
    booking.status = 'cancelled';

    // Add cancellation reason to specialRequests field since there's no dedicated cancellationDetails field
    booking.specialRequests = booking.specialRequests
      ? `${booking.specialRequests}\n\nCancellation reason: ${req.body.reason || 'Customer requested cancellation'}`
      : `Cancellation reason: ${req.body.reason || 'Customer requested cancellation'}`;

    await booking.save();

    // Update tour availability
    const tour = await Tour.findById(booking.tour);
    const selectedDateIndex = tour.startDates.findIndex(
      date => new Date(date.date).toISOString() === new Date(booking.startDate).toISOString()
    );

    if (selectedDateIndex !== -1) {
      // Use the total number of participants (adults + children)
      const totalParticipants = booking.participants.adults + (booking.participants.children || 0);
      tour.startDates[selectedDateIndex].availableSeats += totalParticipants;
      await tour.save();
    }

    // Update payment status
    const payment = await Payment.findOne({ booking: booking._id });
    if (payment) {
      payment.status = 'refunded';
      payment.refundAmount = refundAmount;
      payment.refundReason = req.body.reason || 'Customer requested cancellation';
      payment.refundDate = new Date();
      await payment.save();
    }

    // Create notification
    const notification = new Notification({
      user: req.userId,
      type: 'booking_update',
      title: 'Booking Cancelled',
      message: `Your booking for ${tour.title} has been cancelled. ${refundPercentage > 0 ? `A refund of ${refundAmount} ${booking.totalPrice.currency} will be processed.` : 'No refund will be issued due to late cancellation.'}`,
      relatedTo: {
        model: 'Booking',
        id: booking._id
      }
    });

    await notification.save();

    // Get user details for email
    const user = await User.findById(req.userId);

    // Send booking status update email
    try {
      await sendBookingStatusUpdate(booking, user, tour, 'pending');
      console.log('Booking cancellation email sent successfully');
    } catch (emailError) {
      console.error('Error sending booking cancellation email:', emailError);
      // Don't fail the cancellation if email fails
    }

    res.json({
      booking,
      refundAmount,
      refundPercentage,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});

// Update booking details (only certain fields can be updated)
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the booking belongs to the authenticated user
    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if booking can be updated
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cancelled bookings cannot be updated' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Completed bookings cannot be updated' });
    }

    // Only allow updating contactInfo and specialRequests
    if (req.body.contactInfo) {
      booking.contactInfo = req.body.contactInfo;
    }

    if (req.body.specialRequests !== undefined) {
      booking.specialRequests = req.body.specialRequests;
    }

    await booking.save();

    res.json({
      booking,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Error updating booking' });
  }
});

export default router;
