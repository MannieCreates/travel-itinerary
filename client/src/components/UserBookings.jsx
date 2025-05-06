import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import api from '../services/api';

const UserBookings = () => {
  const { token } = useAuth();
  const { formatPrice } = useCurrency();
  const location = useLocation();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.success ? location.state.message : '');

  const [activeTab, setActiveTab] = useState('upcoming');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchBookings();

    // Clear location state after displaying success message
    if (location.state?.success) {
      window.history.replaceState({}, document.title);
    }
  }, [token]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancelReason) return;

    try {
      setIsCancelling(true);
      await api.put(`/bookings/${selectedBooking._id}/cancel`,
        { reason: cancelReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update booking status locally
      setBookings(bookings.map(booking =>
        booking._id === selectedBooking._id
          ? { ...booking, status: 'cancelled' }
          : booking
      ));

      setSuccessMessage('Booking cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedBooking(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
      console.error('Error cancelling booking:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelReason('');
    setSelectedBooking(null);
  };

  const downloadInvoice = async (bookingId) => {
    try {
      // Try to get existing invoice for this booking
      let invoiceId;

      try {
        const response = await api.get(`/invoices/booking/${bookingId}`);
        if (response.data && response.data._id) {
          invoiceId = response.data._id;
        }
      } catch (error) {
        // If invoice doesn't exist (404) or other error, create a new one
        if (error.response?.status === 404) {
          const createResponse = await api.post(`/invoices/booking/${bookingId}`, {});
          invoiceId = createResponse.data._id;
        } else {
          // Re-throw other errors
          throw error;
        }
      }

      if (invoiceId) {
        // Download the PDF using axios with proper authentication
        const response = await api.get(`/invoices/${invoiceId}/pdf`, {
          responseType: 'blob', // Important for binary data like PDFs
        });

        // Create a blob URL and trigger download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${invoiceId}.pdf`);
        document.body.appendChild(link);
        link.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      } else {
        throw new Error('Failed to get or create invoice');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to download invoice');
      console.error('Error downloading invoice:', err);
    }
  };

  const getFilteredBookings = () => {
    const now = new Date();

    if (activeTab === 'upcoming') {
      return bookings.filter(booking =>
        // Show bookings where start date is in the future AND status is not cancelled or completed
        new Date(booking.startDate) > now &&
        booking.status !== 'cancelled' &&
        booking.status !== 'completed'
      );
    } else if (activeTab === 'past') {
      return bookings.filter(booking =>
        // Show bookings where start date is in the past OR status is completed
        new Date(booking.startDate) < now ||
        booking.status === 'completed'
      );
    } else if (activeTab === 'cancelled') {
      return bookings.filter(booking => booking.status === 'cancelled');
    }

    return bookings;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Bookings</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Bookings</h1>

      {successMessage && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'past'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'cancelled'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cancelled
            </button>
          </nav>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">You don't have any bookings yet</p>
          <Link
            to="/search"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Browse Tours
          </Link>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-600">No {activeTab} bookings found</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="border-b last:border-b-0">
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                  <div className="flex-1">
                    <div className="flex items-start">
                      <div className="w-20 h-20 mr-4">
                        <img
                          src={booking.tour.images[0]?.url || 'https://via.placeholder.com/150'}
                          alt={booking.tour.title}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">
                          <Link to={`/tours/${booking.tour._id}`} className="hover:text-indigo-600">
                            {booking.tour.title}
                          </Link>
                        </h2>
                        <p className="text-gray-500">{booking.tour.destination}</p>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0 md:ml-4">
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(booking.totalPrice.amount, booking.totalPrice.currency)}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {booking.participants.adults} {booking.participants.adults === 1 ? 'adult' : 'adults'}
                        {booking.participants.children > 0 && `, ${booking.participants.children} ${booking.participants.children === 1 ? 'child' : 'children'}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <p className="text-gray-700">
                      <span className="font-medium">Start Date:</span> {new Date(booking.startDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Duration:</span> {booking.tour.duration} days
                    </p>
                  </div>

                  <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
                    {booking.status === 'confirmed' && new Date(booking.startDate) > new Date() && (
                      <button
                        onClick={() => openCancelModal(booking)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Cancel Booking
                      </button>
                    )}
                    <button
                      onClick={() => downloadInvoice(booking._id)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm ml-4"
                    >
                      Download Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">Cancel Booking</h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to cancel your booking for "{selectedBooking.tour.title}"?
              Please note that cancellation policies may apply.
            </p>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Reason for Cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
                required
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                onClick={closeCancelModal}
                className="mr-2 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                No, Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={!cancelReason || isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBookings;
