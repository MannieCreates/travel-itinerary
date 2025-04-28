import express from 'express';
import authRoutes from './auth.js';
import tourRoutes from './tours.js';
import bookingRoutes from './bookings.js';
import cartRoutes from './cart.js';
import wishlistRoutes from './wishlist.js';
import reviewRoutes from './reviews.js';
import userRoutes from './users.js';
import paymentRoutes from './payments.js';
import couponRoutes from './coupons.js';
import blogRoutes from './blog.js';
import faqRoutes from './faq.js';
import weatherRoutes from './weather.js';
import currencyRoutes from './currency.js';
import adminRoutes from './admin.js';
import invoiceRoutes from './invoices.js';
import notificationRoutes from './notifications.js';

const router = express.Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/tours', tourRoutes);
router.use('/bookings', bookingRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/reviews', reviewRoutes);
router.use('/users', userRoutes);
router.use('/payments', paymentRoutes);
router.use('/coupons', couponRoutes);
router.use('/blog', blogRoutes);
router.use('/faq', faqRoutes);
router.use('/weather', weatherRoutes);
router.use('/currency', currencyRoutes);
router.use('/admin', adminRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/notifications', notificationRoutes);

export default router;
