import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const UserReviews = () => {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUserReviews();
  }, [token]);

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reviews/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({
      rating: review.rating,
      title: review.title,
      comment: review.comment
    });
    setFormError('');
    setFormSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setReviewForm({
      rating: 5,
      title: '',
      comment: ''
    });
    setFormError('');
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
      const response = await api.put(`/reviews/${editingReview._id}`, reviewForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update reviews list
      setReviews(reviews.map(review => 
        review._id === editingReview._id ? response.data : review
      ));
      
      setFormSuccess('Review updated successfully');
      setTimeout(() => {
        setEditingReview(null);
        setReviewForm({
          rating: 5,
          title: '',
          comment: ''
        });
        setFormSuccess('');
      }, 2000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update review');
      console.error('Error updating review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    try {
      await api.delete(`/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove review from list
      setReviews(reviews.filter(review => review._id !== reviewId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review');
      console.error('Error deleting review:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Reviews</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Reviews</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Reviews</h1>
      
      {reviews.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">You haven't written any reviews yet</p>
          <Link
            to="/bookings"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            View Your Bookings
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white shadow-md rounded-lg overflow-hidden">
              {editingReview && editingReview._id === review._id ? (
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Edit Your Review</h2>
                  
                  {formError && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      <p>{formError}</p>
                    </div>
                  )}
                  
                  {formSuccess && (
                    <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                      <p>{formSuccess}</p>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-1">
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
                              className={`h-6 w-6 ${
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
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={reviewForm.title}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Review
                      </label>
                      <textarea
                        name="comment"
                        value={reviewForm.comment}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows="4"
                        required
                      ></textarea>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="mr-2 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Updating...' : 'Update Review'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-semibold">
                        <Link to={`/tours/${review.tour._id}`} className="hover:text-indigo-600">
                          {review.tour.title}
                        </Link>
                      </h2>
                      <p className="text-gray-500 text-sm">{review.tour.destination}</p>
                    </div>
                    <div className="flex">
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
                  
                  <h3 className="font-medium mt-3">{review.title}</h3>
                  <p className="text-gray-700 mt-1">{review.comment}</p>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-gray-500 text-sm">
                      Posted on {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                    <div>
                      <button
                        onClick={() => handleEditReview(review)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserReviews;
