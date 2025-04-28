import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendNotificationEmail } from '../utils/emailService.js';

/**
 * Process notifications and send emails
 * This function can be called by a scheduled job or manually
 */
export const processNotifications = async () => {
  try {
    // Find all unread notifications that haven't been emailed yet
    const notifications = await Notification.find({
      isRead: false,
      isEmailSent: false
    }).populate({
      path: 'user',
      select: 'email username'
    });

    console.log(`Processing ${notifications.length} unsent notifications`);

    // Process each notification
    for (const notification of notifications) {
      try {
        // Skip if no user or email
        if (!notification.user || !notification.user.email) {
          console.log(`Skipping notification ${notification._id}: No user or email`);
          continue;
        }

        // Send email
        await sendNotificationEmail(
          notification.user.email,
          notification
        );

        // Mark as sent
        notification.isEmailSent = true;
        await notification.save();
        
        console.log(`Sent notification email to ${notification.user.email}: ${notification.title}`);
      } catch (error) {
        console.error(`Error processing notification ${notification._id}:`, error);
      }
    }

    return { success: true, count: notifications.length };
  } catch (error) {
    console.error('Error processing notifications:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a notification and send email
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} Created notification
 */
export const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();

    // Send email if user has an email
    if (notification.user) {
      const user = await User.findById(notification.user);
      if (user && user.email) {
        try {
          await sendNotificationEmail(user.email, notification);
          notification.isEmailSent = true;
          await notification.save();
        } catch (emailError) {
          console.error('Error sending notification email:', emailError);
        }
      }
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Send a bulk notification to multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {Object} notificationData - Notification data without user field
 * @returns {Promise<Object>} Result with count of notifications created
 */
export const sendBulkNotification = async (userIds, notificationData) => {
  try {
    const users = await User.find({ _id: { $in: userIds } });
    let createdCount = 0;

    for (const user of users) {
      try {
        const notification = new Notification({
          ...notificationData,
          user: user._id
        });
        await notification.save();
        createdCount++;

        // Send email
        if (user.email) {
          try {
            await sendNotificationEmail(user.email, notification);
            notification.isEmailSent = true;
            await notification.save();
          } catch (emailError) {
            console.error(`Error sending notification email to ${user.email}:`, emailError);
          }
        }
      } catch (notifError) {
        console.error(`Error creating notification for user ${user._id}:`, notifError);
      }
    }

    return { success: true, count: createdCount };
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    return { success: false, error: error.message };
  }
};
