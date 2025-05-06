import express from 'express';
import Invoice from '../models/Invoice.js';
import Booking from '../models/Booking.js';
import Tour from '../models/Tour.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get user's invoices
router.get('/user', auth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.userId })
      .populate({
        path: 'booking',
        select: 'startDate status'
      })
      .sort('-issueDate');

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices', error: error.message });
  }
});

// Get invoice by booking ID
router.get('/booking/:bookingId', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find invoice for this booking
    const invoice = await Invoice.findOne({ booking: bookingId })
      .populate({
        path: 'booking',
        select: 'startDate status participants specialRequests user',
        populate: {
          path: 'tour',
          select: 'title destination duration price'
        }
      });

    if (!invoice) {
      return res.status(404).json({ message: 'No invoice found for this booking' });
    }

    // Check if user is authorized to view this invoice
    if (invoice.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoice', error: error.message });
  }
});

// Get a specific invoice
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id)
      .populate({
        path: 'booking',
        select: 'startDate status participants specialRequests',
        populate: {
          path: 'tour',
          select: 'title destination duration price'
        }
      })
      .populate({
        path: 'user',
        select: 'username email'
      });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check if user is authorized to view this invoice
    if (invoice.user._id.toString() !== req.userId) {
      // In a real app, check if user is admin
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoice', error: error.message });
  }
});

// Generate invoice PDF
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id)
      .populate({
        path: 'booking',
        select: 'startDate status participants specialRequests',
        populate: {
          path: 'tour',
          select: 'title destination duration price'
        }
      })
      .populate({
        path: 'user',
        select: 'username email'
      });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check if user is authorized to view this invoice
    if (invoice.user._id.toString() !== req.userId) {
      // In a real app, check if user is admin
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads/invoices');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create PDF file path
    const pdfPath = path.join(uploadsDir, `invoice-${invoice.invoiceNumber}.pdf`);

    // Check if PDF already exists and is recent (less than 1 hour old)
    if (fs.existsSync(pdfPath)) {
      const stats = fs.statSync(pdfPath);
      const fileAge = (new Date() - stats.mtime) / 1000 / 60; // age in minutes

      if (fileAge < 60) {
        // If PDF exists and is recent, just send it
        return res.download(pdfPath);
      }
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(pdfPath);

    // Set up promise to know when the PDF is done being written
    const pdfFinished = new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    doc.pipe(writeStream);

    // Add company logo
    // doc.image('path/to/logo.png', 50, 45, { width: 150 });

    // Add invoice header
    doc.fontSize(20).text('INVOICE', { align: 'right' });
    doc.fontSize(10).text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'right' });
    doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, { align: 'right' });
    if (invoice.dueDate) {
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, { align: 'right' });
    }
    doc.moveDown();

    // Add company info
    doc.fontSize(12).text('Travel Itinerary Services', { align: 'left' });
    doc.fontSize(10).text('123 Travel Street', { align: 'left' });
    doc.text('Wanderlust City, WL 12345', { align: 'left' });
    doc.text('Phone: (123) 456-7890', { align: 'left' });
    doc.text('Email: billing@travelitinerary.com', { align: 'left' });
    doc.moveDown();

    // Add customer info
    doc.fontSize(12).text('Bill To:', { align: 'left' });
    doc.fontSize(10).text(`Name: ${invoice.billingAddress.name || invoice.user.username}`, { align: 'left' });
    if (invoice.billingAddress.address) {
      doc.text(`Address: ${invoice.billingAddress.address}`, { align: 'left' });
      doc.text(`${invoice.billingAddress.city}, ${invoice.billingAddress.state} ${invoice.billingAddress.postalCode}`, { align: 'left' });
      doc.text(`Country: ${invoice.billingAddress.country}`, { align: 'left' });
    }
    doc.text(`Email: ${invoice.billingAddress.email || invoice.user.email}`, { align: 'left' });
    if (invoice.billingAddress.phone) {
      doc.text(`Phone: ${invoice.billingAddress.phone}`, { align: 'left' });
    }
    doc.moveDown();

    // Add booking info
    doc.fontSize(12).text('Booking Details:', { align: 'left' });
    doc.fontSize(10).text(`Tour: ${invoice.booking.tour.title}`, { align: 'left' });
    doc.text(`Destination: ${invoice.booking.tour.destination}`, { align: 'left' });
    doc.text(`Start Date: ${new Date(invoice.booking.startDate).toLocaleDateString()}`, { align: 'left' });
    doc.text(`Duration: ${invoice.booking.tour.duration} days`, { align: 'left' });
    doc.text(`Participants: ${invoice.booking.participants.adults} adults, ${invoice.booking.participants.children} children`, { align: 'left' });
    doc.moveDown();

    // Add invoice items
    doc.fontSize(12).text('Invoice Items:', { align: 'left' });
    doc.moveDown();

    // Create table headers
    const tableTop = doc.y;
    doc.fontSize(10);
    doc.text('Description', 50, tableTop);
    doc.text('Quantity', 250, tableTop);
    doc.text('Unit Price', 350, tableTop);
    doc.text('Total', 450, tableTop);
    doc.moveDown();

    // Add table rows
    let tableRowY = doc.y;
    invoice.items.forEach(item => {
      doc.text(item.description || `${invoice.booking.tour.title} - Tour Package`, 50, tableRowY);
      doc.text(item.quantity.toString(), 250, tableRowY);
      doc.text(`${item.unitPrice} ${invoice.currency}`, 350, tableRowY);
      doc.text(`${item.totalPrice} ${invoice.currency}`, 450, tableRowY);
      tableRowY += 20;
    });
    doc.moveDown();

    // Add totals
    doc.text('Subtotal:', 350, tableRowY);
    doc.text(`${invoice.subtotal} ${invoice.currency}`, 450, tableRowY);
    tableRowY += 20;

    if (invoice.discount > 0) {
      doc.text('Discount:', 350, tableRowY);
      doc.text(`-${invoice.discount} ${invoice.currency}`, 450, tableRowY);
      tableRowY += 20;
    }

    if (invoice.tax > 0) {
      doc.text('Tax:', 350, tableRowY);
      doc.text(`${invoice.tax} ${invoice.currency}`, 450, tableRowY);
      tableRowY += 20;
    }

    doc.fontSize(12);
    doc.text('Total:', 350, tableRowY);
    doc.text(`${invoice.total} ${invoice.currency}`, 450, tableRowY);
    doc.moveDown();

    // Add payment info
    doc.fontSize(10).text(`Payment Method: ${invoice.paymentMethod}`, { align: 'left' });
    doc.text(`Payment Status: ${invoice.paymentStatus}`, { align: 'left' });
    doc.moveDown();

    // Add notes
    if (invoice.notes) {
      doc.fontSize(12).text('Notes:', { align: 'left' });
      doc.fontSize(10).text(invoice.notes, { align: 'left' });
      doc.moveDown();
    }

    // Add footer
    doc.fontSize(10).text('Thank you for your business!', { align: 'center' });
    doc.text('For any questions regarding this invoice, please contact our customer service.', { align: 'center' });

    // Finalize PDF
    doc.end();

    // Wait for PDF to be fully written
    await pdfFinished;

    // Update invoice with PDF URL
    invoice.pdfUrl = `/uploads/invoices/invoice-${invoice.invoiceNumber}.pdf`;
    await invoice.save();

    // Send PDF file
    res.download(pdfPath);
  } catch (error) {
    res.status(500).json({ message: 'Error generating invoice PDF', error: error.message });
  }
});

// Create invoice for a booking
router.post('/booking/:bookingId', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { billingAddress, notes } = req.body;

    // Check if booking exists
    const booking = await Booking.findById(bookingId).populate('tour');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized
    if (booking.user.toString() !== req.userId) {
      // In a real app, check if user is admin
      return res.status(403).json({ message: 'Not authorized to create invoice for this booking' });
    }

    // Check if invoice already exists for this booking
    const existingInvoice = await Invoice.findOne({ booking: bookingId });
    if (existingInvoice) {
      return res.status(400).json({ message: 'Invoice already exists for this booking' });
    }

    // Get user details
    const user = await User.findById(req.userId);

    // Calculate invoice items
    const adultPrice = booking.tour.price.amount;
    const childPrice = adultPrice * 0.5; // 50% discount for children

    const items = [
      {
        tour: booking.tour._id,
        description: `${booking.tour.title} - Adult Package`,
        quantity: booking.participants.adults,
        unitPrice: adultPrice,
        totalPrice: adultPrice * booking.participants.adults
      }
    ];

    if (booking.participants.children > 0) {
      items.push({
        tour: booking.tour._id,
        description: `${booking.tour.title} - Child Package`,
        quantity: booking.participants.children,
        unitPrice: childPrice,
        totalPrice: childPrice * booking.participants.children
      });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = booking.couponApplied ? booking.couponApplied.discount : 0;
    const tax = 0; // No tax for this example
    const total = subtotal - discount + tax;

    // Create invoice
    const invoice = new Invoice({
      booking: bookingId,
      user: req.userId,
      items,
      subtotal,
      discount,
      tax,
      total,
      currency: booking.tour.price.currency,
      paymentMethod: booking.paymentInfo.method,
      paymentStatus: booking.paymentInfo.status,
      billingAddress: billingAddress || {
        name: user.username,
        email: user.email
      },
      notes,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Due in 7 days
    });

    await invoice.save();

    // Update booking with invoice reference
    booking.invoice = {
      number: invoice.invoiceNumber,
      generatedAt: new Date()
    };
    await booking.save();

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error creating invoice', error: error.message });
  }
});

export default router;
