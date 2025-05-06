import React, { useState, useEffect } from 'react';
import { getTourReviews, submitReview, getUserCompletedBookings } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TourReviews = ({ tourId, tourTitle }) => {
  const { token, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [completedBookings, setCompletedBookings] = useState([]);

  useEffect(() => {
    const loadReviews = async () => {
      await fetchReviews();
      // After reviews are loaded, check eligibility if user is logged in
      if (token && user) {
        checkReviewEligibility();
      }
    };

    loadReviews();
  }, [tourId, currentPage, token, user?.id]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getTourReviews(tourId, currentPage);
      setReviews(data.reviews);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setError(null);
    } catch (err) {
      setError('Failed to load reviews. Please try again later.');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkReviewEligibility = async () => {
    try {
      // Check if user has completed bookings for this tour
      const bookings = await getUserCompletedBookings();
      setCompletedBookings(bookings);

      const hasCompletedTour = bookings.some(booking => booking.tour._id === tourId);
      setCanReview(hasCompletedTour);

      // Check if user has already reviewed this tour
      // We need to fetch the user's reviews directly to check this properly
      const userReviews = await getTourReviews(tourId);
      const userReview = userReviews.reviews.find(review => review.user._id === user?.id);
      setHasReviewed(!!userReview);
    } catch (err) {
      console.error('Error checking review eligibility:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (rating) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!reviewForm.title.trim() || !reviewForm.comment.trim()) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitReview({
        tourId,
        ...reviewForm
      });

      setFormSuccess('Review submitted successfully!');
      setReviewForm({
        rating: 5,
        title: '',
        comment: ''
      });

      // Refresh reviews to show the new one
      try {
        await fetchReviews();
      } catch (refreshErr) {
        console.error('Error refreshing reviews:', refreshErr);
        // Don't fail the submission if refresh fails
      }

      setHasReviewed(true);
      setShowReviewForm(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setFormSuccess('');
      }, 3000);
    } catch (err) {
      // If we get a 400 error about already reviewing, handle it gracefully
      if (err.response && err.response.status === 400 &&
          err.response.data && err.response.data.message &&
          err.response.data.message.includes('already reviewed')) {
        setFormError('You have already reviewed this tour.');
        setHasReviewed(true);
      } else {
        setFormError(err.message || 'Failed to submit review. Please try again.');
      }
      console.error('Error submitting review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reviews</h2>
        {token ? (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition duration-300"
          >
            Write a Review
          </button>
        ) : (
          <div className="text-sm text-gray-600">
            Log in to leave a review
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      {formSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <p>{formSuccess}</p>
        </div>
      )}

      {showReviewForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Write a Review for {tourTitle}</h3>

          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Rating
              </label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-8 w-8 ${
                        star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={reviewForm.title}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Summarize your experience"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Review
              </label>
              <textarea
                name="comment"
                value={reviewForm.comment}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                rows="4"
                placeholder="Share your experience with this tour"
                required
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}



      {reviews.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">No reviews yet for this tour.</p>
          {token && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition duration-300"
            >
              Be the first to review
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="font-medium text-gray-800 mr-2">{review.user.username}</span>
                    <span className="text-gray-500 text-sm">• {formatDate(review.createdAt)}</span>
                  </div>
                  <div className="flex mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 ${
                          star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{review.title}</h3>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === i + 1
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default TourReviews;
