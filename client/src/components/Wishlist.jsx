import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

const Wishlist = () => {
  const { wishlist, loading, error, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const handleRemoveItem = async (tourId) => {
    await removeFromWishlist(tourId);
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      await clearWishlist();
    }
  };

  const handleAddToCart = async (tour) => {
    // Get the first available start date
    const startDate = tour.startDates && tour.startDates.length > 0
      ? new Date(tour.startDates[0].date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const result = await addToCart(tour._id, startDate, 1);
    
    if (result.success) {
      alert('Tour added to cart successfully!');
    } else {
      alert(result.error || 'Failed to add tour to cart');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!wishlist.tours || wishlist.tours.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">Your wishlist is empty</p>
          <Link
            to="/search"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Browse Tours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Wishlist</h1>
        <button
          onClick={handleClearWishlist}
          className="text-red-500 hover:text-red-700"
        >
          Clear Wishlist
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.tours.map((tour) => (
          <div key={tour._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              <img
                src={tour.images[0]?.url || 'https://via.placeholder.com/300x200'}
                alt={tour.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => handleRemoveItem(tour._id)}
                  className="bg-white rounded-full p-1 shadow hover:bg-gray-100"
                  title="Remove from wishlist"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold mb-1">
                  <Link to={`/tours/${tour._id}`} className="hover:text-indigo-600">
                    {tour.title}
                  </Link>
                </h2>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 text-gray-700">{tour.rating || 'N/A'}</span>
                  <span className="ml-1 text-gray-500 text-sm">({tour.totalReviews || 0})</span>
                </div>
              </div>
              
              <p className="text-gray-500 text-sm mb-2">{tour.destination}</p>
              
              <div className="flex justify-between items-center mb-3">
                <div>
                  <span className="text-gray-500 text-sm">{tour.duration} days</span>
                </div>
                <div className="font-semibold">
                  {formatPrice(tour.price.amount, tour.price.currency)}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Link
                  to={`/tours/${tour._id}`}
                  className="flex-1 bg-white border border-indigo-600 text-indigo-600 text-center py-2 rounded hover:bg-indigo-50"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleAddToCart(tour)}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
