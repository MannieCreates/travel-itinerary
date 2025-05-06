import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const EmailTest = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    title: 'Test Notification',
    message: 'This is a test notification with email delivery.',
    type: 'system',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/notifications/test', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResult({
        success: true,
        data: response.data,
        message: 'Notification created and email sent successfully!'
      });
    } catch (error) {
      setResult({
        success: false,
        error: error.response?.data?.message || 'An error occurred',
        message: 'Failed to send notification email.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Email Notification Test</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address for testing (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            If provided, the email will be sent to this address instead of your account email.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notification Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notification Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="system">System</option>
            <option value="booking_confirmation">Booking Confirmation</option>
            <option value="booking_reminder">Booking Reminder</option>
            <option value="booking_update">Booking Update</option>
            <option value="payment_confirmation">Payment Confirmation</option>
            <option value="tour_update">Tour Update</option>
            <option value="promotion">Promotion</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Sending...' : 'Send Test Email'}
          </button>
        </div>
      </form>

      {result && (
        <div className={`mt-4 p-4 rounded-md ${
          result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <p className="font-medium">{result.message}</p>
          {result.success ? (
            <div className="text-sm mt-2">
              <p>Notification ID: {result.data._id}</p>
              {result.data.customEmailSent && (
                <p className="mt-1">
                  Email sent to: <span className="font-medium">{result.data.emailAddress}</span>
                </p>
              )}
              {result.data.customEmailSent === false && (
                <p className="mt-1 text-red-600">
                  Failed to send email: {result.data.emailError}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm mt-2">Error: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailTest;
