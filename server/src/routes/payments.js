import express from 'express';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Invoice from '../models/Invoice.js';
import Notification from '../models/Notification.js';
import Cart from '../models/Cart.js';
import Tour from '../models/Tour.js';
import { auth } from '../middleware/auth.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { sendBookingConfirmation } from '../utils/emailService.js';

const router = express.Router();

// Get all payments for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.userId })
      .populate({
        path: 'booking',
        select: 'tour startDate travelers status',
        populate: {
          path: 'tour',
          select: 'title images'
        }
      })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

// Get a specific payment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'booking',
        select: 'tour startDate travelers status totalPrice',
        populate: {
          path: 'tour',
          select: 'title images destination duration'
        }
      });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if the payment belongs to the authenticated user
    if (payment.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Error fetching payment' });
  }
});

// Process a payment
router.post('/process', auth, async (req, res) => {
  try {
    const {
      bookingId,
      paymentMethod,
      paymentDetails,
      billingAddress
    } = req.body;

    // Validate required fields
    if (!bookingId || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the booking belongs to the authenticated user
    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if booking is already paid
    if (booking.status === 'confirmed' || booking.status === 'completed') {
      return res.status(400).json({ message: 'Booking is already paid' });
    }

    // Find existing payment or create new one
    let payment = await Payment.findOne({ booking: bookingId });

    if (!payment) {
      payment = new Payment({
        booking: bookingId,
        user: req.userId,
        amount: booking.totalPrice,
        currency: booking.currency,
        paymentMethod,
        status: 'pending'
      });
    }

    // Update payment details
    payment.paymentMethod = paymentMethod;
    payment.paymentDetails = paymentDetails || {};
    payment.billingAddress = billingAddress || {};

    // In a real application, you would process the payment with a payment gateway here
    // For this example, we'll simulate a successful payment
    payment.status = 'completed';
    payment.transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await payment.save();

    // Update booking status
    booking.status = 'confirmed';
    await booking.save();

    // Update invoice status
    const invoice = await Invoice.findOne({ booking: bookingId });
    if (invoice) {
      invoice.paymentStatus = 'paid';
      await invoice.save();
    }

    // Create notification
    const notification = new Notification({
      user: req.userId,
      type: 'payment_confirmation',
      title: 'Payment Confirmation',
      message: `Your payment of ${payment.amount} ${payment.currency} for booking #${booking._id} has been processed successfully.`,
      relatedTo: {
        model: 'Payment',
        id: payment._id
      },
      isEmailSent: true
    });

    await notification.save();

    res.json({
      payment,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Error processing payment' });
  }
});

// Request a refund
router.post('/:id/refund', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if the payment belongs to the authenticated user
    if (payment.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if payment can be refunded
    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed payments can be refunded' });
    }

    if (payment.refundAmount > 0) {
      return res.status(400).json({ message: 'Payment has already been refunded' });
    }

    // Get the booking
    const booking = await Booking.findById(payment.booking);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Calculate refund amount based on cancellation policy
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

    const refundAmount = (payment.amount * refundPercentage) / 100;

    // Update payment
    payment.status = 'refunded';
    payment.refundAmount = refundAmount;
    payment.refundReason = req.body.reason || 'Customer requested refund';
    payment.refundDate = new Date();

    await payment.save();

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationDetails = {
      cancelledAt: new Date(),
      reason: req.body.reason || 'Customer requested refund',
      refundAmount,
      refundPercentage
    };

    await booking.save();

    // Create notification
    const notification = new Notification({
      user: req.userId,
      type: 'payment_confirmation',
      title: 'Refund Processed',
      message: `Your refund of ${refundAmount} ${payment.currency} for booking #${booking._id} has been processed. ${refundPercentage < 100 ? `A cancellation fee of ${payment.amount - refundAmount} ${payment.currency} was applied.` : ''}`,
      relatedTo: {
        model: 'Payment',
        id: payment._id
      },
      isEmailSent: true
    });

    await notification.save();

    res.json({
      payment,
      refundAmount,
      refundPercentage,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ message: 'Error processing refund' });
  }
});

// Process cart payment and create bookings
router.post('/process-cart', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { paymentMethod, paymentDetails, billingAddress, couponCode } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.userId }).populate({
      path: 'items.tour',
      select: 'title price startDates'
    });

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total amount
    const totalAmount = cart.calculateTotal();

    // Apply discount if coupon is valid (simplified for now)
    let discount = 0;
    if (couponCode) {
      // In a real app, you would validate the coupon here
      // For now, we'll just apply a 10% discount if any coupon is provided
      discount = totalAmount * 0.1;
    }

    const finalAmount = totalAmount - discount;

    // Create bookings for each cart item
    const bookings = [];

    for (const item of cart.items) {
      // Verify tour and available seats
      const tour = await Tour.findById(item.tour._id);

      if (!tour) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: `Tour not found: ${item.tour.title}` });
      }

      // Find the selected date
      const selectedDate = tour.startDates.find(
        date => new Date(date.date).toISOString().split('T')[0] ===
                new Date(item.startDate).toISOString().split('T')[0]
      );

      if (!selectedDate) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Selected date is not available for tour: ${tour.title}` });
      }

      if (selectedDate.availableSeats < item.travelers) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Not enough seats available for tour: ${tour.title}` });
      }

      // Update available seats
      const dateIndex = tour.startDates.findIndex(
        date => new Date(date.date).toISOString() === new Date(selectedDate.date).toISOString()
      );

      tour.startDates[dateIndex].availableSeats -= item.travelers;
      await tour.save({ session });

      // Create booking
      const booking = new Booking({
        user: req.userId,
        tour: item.tour._id,
        startDate: item.startDate,
        participants: {
          adults: item.travelers,
          children: 0
        },
        totalPrice: {
          amount: item.price.amount * item.travelers,
          currency: item.price.currency
        },
        paymentInfo: {
          method: paymentMethod,
          status: 'completed',
          transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        },
        status: 'confirmed'
      });

      await booking.save({ session });
      bookings.push(booking);
    }

    // Create payment record
    const payment = new Payment({
      booking: bookings[0]._id, // Reference to first booking (in a real app, you might handle multiple bookings differently)
      user: req.userId,
      amount: finalAmount,
      currency: cart.items[0].price.currency,
      paymentMethod,
      status: 'completed',
      transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      paymentDetails: {
        ...paymentDetails,
        cardLast4: paymentDetails?.cardLast4 || '',
        cardBrand: paymentDetails?.cardBrand || ''
      },
      billingAddress
    });

    await payment.save({ session });

    // Create invoice for each booking
    for (const booking of bookings) {
      const invoice = new Invoice({
        booking: booking._id,
        invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user: req.userId,
        items: [{
          tour: booking.tour,
          description: `Tour booking for ${booking.participants.adults} travelers`,
          quantity: booking.participants.adults,
          unitPrice: booking.totalPrice.amount / booking.participants.adults,
          totalPrice: booking.totalPrice.amount
        }],
        subtotal: booking.totalPrice.amount,
        discount: 0,
        tax: booking.totalPrice.amount * 0.1, // 10% tax
        total: booking.totalPrice.amount * 1.1,
        currency: booking.totalPrice.currency,
        paymentMethod,
        paymentStatus: 'paid',
        billingAddress,
        issueDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 14)) // Due in 14 days
      });

      await invoice.save({ session });

      // Create notification
      const notification = new Notification({
        user: req.userId,
        type: 'booking_confirmation',
        title: 'Booking Confirmation',
        message: `Your booking has been confirmed. Your booking ID is ${booking._id}.`,
        relatedTo: {
          model: 'Booking',
          id: booking._id
        }
      });

      await notification.save({ session });
    }

    // Clear the cart
    cart.items = [];
    cart.couponCode = null;
    await cart.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Get user details for email
    const user = await User.findById(req.userId);
    
    // Send booking confirmation emails after transaction is committed
    for (const booking of bookings) {
      try {
        const tour = await Tour.findById(booking.tour);
        await sendBookingConfirmation(booking, user, tour);
        console.log(`Booking confirmation email sent for booking ${booking._id}`);
      } catch (emailError) {
        console.error('Error sending booking confirmation email:', emailError);
        // Don't fail the process if email sending fails
      }
    }

    // Populate booking details for response
    const populatedBookings = await Booking.find({
      _id: { $in: bookings.map(b => b._id) }
    }).populate({
      path: 'tour',
      select: 'title images destination duration'
    });

    res.status(200).json({
      success: true,
      payment: {
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status
      },
      bookings: populatedBookings
    });

  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();

    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
});

export default router;

