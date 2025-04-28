import express from 'express';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { processNotifications, createNotification, sendBulkNotification } from '../controllers/notificationController.js';
import { sendNotificationEmail } from '../utils/emailService.js';

const router = express.Router();

// Get user's notifications
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, read } = req.query;

    // Build query
    const query = { user: req.userId };
    if (read !== undefined) {
      query.isRead = read === 'true';
    }

    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ user: req.userId, isRead: false });

    res.json({
      notifications,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user owns the notification
    if (notification.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this notification' });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications', error: error.message });
  }
});

// Delete a notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user owns the notification
    if (notification.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }

    await Notification.findByIdAndDelete(id);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
});

// Delete all read notifications
router.delete('/delete-read', auth, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.userId, isRead: true });
    res.json({ message: 'All read notifications deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notifications', error: error.message });
  }
});

// Create a notification (for testing)
router.post('/test', auth, async (req, res) => {
  try {
    const { title, message, type, email } = req.body;

    if (!title || !message || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create notification using the controller
    const notification = await createNotification({
      user: req.userId,
      type,
      title,
      message,
      isRead: false
    });

    // If a custom email is provided, send directly to that email
    if (email) {
      try {
        await sendNotificationEmail(email, notification);
        notification.isEmailSent = true;
        await notification.save();

        return res.status(201).json({
          ...notification.toObject(),
          customEmailSent: true,
          emailAddress: email
        });
      } catch (emailError) {
        console.error('Error sending to custom email:', emailError);
        return res.status(201).json({
          ...notification.toObject(),
          customEmailSent: false,
          emailError: emailError.message
        });
      }
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error creating notification', error: error.message });
  }
});

// Process all pending notifications (admin only)
router.post('/process', auth, async (req, res) => {
  try {
    // In a real app, check if user is admin
    const result = await processNotifications();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error processing notifications', error: error.message });
  }
});

// Send a bulk notification (admin only)
router.post('/bulk', auth, async (req, res) => {
  try {
    // In a real app, check if user is admin
    const { userIds, title, message, type } = req.body;

    if (!userIds || !Array.isArray(userIds) || !title || !message || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await sendBulkNotification(userIds, {
      type,
      title,
      message,
      isRead: false
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error sending bulk notifications', error: error.message });
  }
});

export default router;
