import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables if not already loaded
dotenv.config();

// SendPulse API credentials from environment variables
const CLIENT_ID = process.env.SENDPULSE_CLIENT_ID;
const CLIENT_SECRET = process.env.SENDPULSE_CLIENT_SECRET;

/**
 * Get OAuth token from SendPulse API
 * @returns {Promise<string>} Access token
 */
async function getAccessToken() {
  try {
    const response = await axios.post('https://api.sendpulse.com/oauth/access_token',
      {
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting SendPulse access token:', error.message);
    throw new Error('Failed to authenticate with email service');
  }
}

/**
 * Send an email using SendPulse API
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content of the email
 * @param {string} textContent - Plain text content of the email
 * @returns {Promise<Object>} Response from SendPulse API
 */
export async function sendEmail(to, subject, htmlContent, textContent) {
  if (!to) {
    console.log('No recipient email provided, skipping email send');
    return;
  }

  try {
    // Get access token
    const accessToken = await getAccessToken();

    // Prepare email payload
    const emailPayload = {
      email: {
        html: htmlContent,
        text: textContent || htmlContent.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version if not provided
        subject: subject,
        from: {
          name: "Travel Itinerary",
          email: "info@perk.ink"
        },
        to: [
          {
            name: "User",
            email: to
          }
        ]
      }
    };

    // Send the email
    const response = await axios.post('https://api.sendpulse.com/smtp/emails',
      emailPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    console.log('Email sent successfully to:', to);
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error.message);
    if (error.response) {
      console.error('API response:', error.response.data);
    }
    throw new Error('Failed to send email');
  }
}

/**
 * Send a booking confirmation email
 * @param {Object} booking - Booking object with details
 * @param {Object} user - User object with email
 * @param {Object} tour - Tour object with details
 * @returns {Promise<Object>} Response from SendPulse API
 */
export async function sendBookingConfirmation(booking, user, tour) {
  const subject = `Booking Confirmation - ${tour.title}`;

  const startDate = new Date(booking.startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4CAF50; padding: 20px; text-align: center; color: white;">
        <h1>Booking Confirmation</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p>Dear ${user.username},</p>
        <p>Thank you for booking with Travel Itinerary! Your booking has been confirmed.</p>

        <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50;">
          <h2 style="margin-top: 0;">${tour.title}</h2>
          <p><strong>Destination:</strong> ${tour.destination}</p>
          <p><strong>Start Date:</strong> ${startDate}</p>
          <p><strong>Duration:</strong> ${tour.duration} days</p>
          <p><strong>Booking ID:</strong> ${booking._id}</p>
          <p><strong>Status:</strong> ${booking.status}</p>
          <p><strong>Total Price:</strong> ${booking.totalPrice.amount} ${booking.totalPrice.currency}</p>
        </div>

        <p>You can view your booking details and manage your reservation in your <a href="http://localhost:3000/bookings" style="color: #4CAF50;">account dashboard</a>.</p>

        <p>If you have any questions or need assistance, please don't hesitate to contact our customer support team.</p>

        <p>We look forward to providing you with an unforgettable travel experience!</p>

        <p>Best regards,<br>Travel Itinerary Team</p>
      </div>
      <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #666;">
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </div>
  `;

  const textContent = `
    Booking Confirmation

    Dear ${user.username},

    Thank you for booking with Travel Itinerary! Your booking has been confirmed.

    Tour: ${tour.title}
    Destination: ${tour.destination}
    Start Date: ${startDate}
    Duration: ${tour.duration} days
    Booking ID: ${booking._id}
    Status: ${booking.status}
    Total Price: ${booking.totalPrice.amount} ${booking.totalPrice.currency}

    You can view your booking details and manage your reservation in your account dashboard: http://localhost:3000/bookings

    If you have any questions or need assistance, please don't hesitate to contact our customer support team.

    We look forward to providing you with an unforgettable travel experience!

    Best regards,
    Travel Itinerary Team

    This is an automated email. Please do not reply to this message.
  `;

  return sendEmail(user.email, subject, htmlContent, textContent);
}

/**
 * Send a booking status update email
 * @param {Object} booking - Booking object with details
 * @param {Object} user - User object with email
 * @param {Object} tour - Tour object with details
 * @param {string} oldStatus - Previous booking status
 * @returns {Promise<Object>} Response from SendPulse API
 */
export async function sendBookingStatusUpdate(booking, user, tour, oldStatus) {
  const subject = `Booking Status Update - ${tour.title}`;

  const startDate = new Date(booking.startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #2196F3; padding: 20px; text-align: center; color: white;">
        <h1>Booking Status Update</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p>Dear ${user.username},</p>
        <p>The status of your booking has been updated.</p>

        <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #2196F3;">
          <h2 style="margin-top: 0;">${tour.title}</h2>
          <p><strong>Destination:</strong> ${tour.destination}</p>
          <p><strong>Start Date:</strong> ${startDate}</p>
          <p><strong>Booking ID:</strong> ${booking._id}</p>
          <p><strong>Previous Status:</strong> ${oldStatus}</p>
          <p><strong>New Status:</strong> ${booking.status}</p>
        </div>

        <p>You can view your booking details and manage your reservation in your <a href="http://localhost:3000/bookings" style="color: #2196F3;">account dashboard</a>.</p>

        <p>If you have any questions or need assistance, please don't hesitate to contact our customer support team.</p>

        <p>Best regards,<br>Travel Itinerary Team</p>
      </div>
      <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #666;">
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </div>
  `;

  const textContent = `
    Booking Status Update

    Dear ${user.username},

    The status of your booking has been updated.

    Tour: ${tour.title}
    Destination: ${tour.destination}
    Start Date: ${startDate}
    Booking ID: ${booking._id}
    Previous Status: ${oldStatus}
    New Status: ${booking.status}

    You can view your booking details and manage your reservation in your account dashboard: http://localhost:3000/bookings

    If you have any questions or need assistance, please don't hesitate to contact our customer support team.

    Best regards,
    Travel Itinerary Team

    This is an automated email. Please do not reply to this message.
  `;

  return sendEmail(user.email, subject, htmlContent, textContent);
}

/**
 * Send a promotional email
 * @param {string} to - Recipient email address
 * @param {Object} promotion - Promotion details
 * @returns {Promise<Object>} Response from SendPulse API
 */
export async function sendPromotionalEmail(to, promotion) {
  const subject = promotion.title || 'Special Offer from Travel Itinerary';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #FF5722; padding: 20px; text-align: center; color: white;">
        <h1>${promotion.title}</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p>Dear Traveler,</p>
        <p>${promotion.description}</p>

        ${promotion.imageUrl ? `<img src="${promotion.imageUrl}" alt="${promotion.title}" style="max-width: 100%; height: auto; margin: 20px 0;">` : ''}

        <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #FF5722;">
          <h2 style="margin-top: 0;">Offer Details</h2>
          <p>${promotion.details}</p>
          ${promotion.couponCode ? `<p><strong>Use Coupon Code:</strong> ${promotion.couponCode}</p>` : ''}
          ${promotion.validUntil ? `<p><strong>Valid Until:</strong> ${new Date(promotion.validUntil).toLocaleDateString()}</p>` : ''}
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000/search" style="background-color: #FF5722; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Explore Tours</a>
        </div>

        <p>We hope to see you soon!</p>

        <p>Best regards,<br>Travel Itinerary Team</p>
      </div>
      <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #666;">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>If you wish to unsubscribe from promotional emails, please click <a href="http://localhost:3000/unsubscribe" style="color: #666;">here</a>.</p>
      </div>
    </div>
  `;

  const textContent = `
    ${promotion.title}

    Dear Traveler,

    ${promotion.description}

    Offer Details:
    ${promotion.details}
    ${promotion.couponCode ? `Use Coupon Code: ${promotion.couponCode}` : ''}
    ${promotion.validUntil ? `Valid Until: ${new Date(promotion.validUntil).toLocaleDateString()}` : ''}

    Explore Tours: http://localhost:3000/search

    We hope to see you soon!

    Best regards,
    Travel Itinerary Team

    This is an automated email. Please do not reply to this message.
    If you wish to unsubscribe from promotional emails, please visit: http://localhost:3000/unsubscribe
  `;

  return sendEmail(to, subject, htmlContent, textContent);
}

/**
 * Send a notification email for system events
 * @param {string} to - Recipient email address
 * @param {Object} notification - Notification object with details
 * @returns {Promise<Object>} Response from SendPulse API
 */
export async function sendNotificationEmail(to, notification) {
  return sendEmail(
    to,
    notification.title,
    `<h1>${notification.title}</h1><p>${notification.message}</p>`,
    `${notification.title}\n\n${notification.message}`
  );
}
