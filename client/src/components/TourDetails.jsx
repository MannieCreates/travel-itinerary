import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTourById, getTourWeather, getTourAvailability } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import GoogleMap from './shared/GoogleMap';
import WeatherDisplay from './shared/WeatherDisplay';
import TourReviews from './shared/TourReviews';

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addToCart, cart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { formatPrice, convertPrice } = useCurrency();

  const [tour, setTour] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });
  const [weatherData, setWeatherData] = useState(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityUpdated, setAvailabilityUpdated] = useState(false);
  const availabilityCheckIntervalRef = useRef(null);

  useEffect(() => {
    const fetchTourDetails = async () => {
      try {
        setIsLoading(true);

        // Check if id is "search" - this is an invalid ID and will cause an error
        if (id === 'search') {
          setError('Invalid tour ID. Please select a valid tour.');
          return;
        }

        const data = await getTourById(id);
        setTour(data);
      } catch (err) {
        if (err.response?.status === 400) {
          setError('Invalid tour ID format. Please select a valid tour.');
        } else if (err.response?.status === 404) {
          setError('Tour not found. It may have been removed or is no longer available.');
        } else {
          setError('Failed to load tour details. Please try again later.');
        }
        console.error('Error fetching tour:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTourDetails();
  }, [id]);

  // Fetch weather data when tour is loaded
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!tour || !tour._id) return;

      try {
        setIsLoadingWeather(true);

        // If tour already has weather data that's less than 3 hours old, use that
        if (
          tour.weather &&
          tour.weather.lastUpdated &&
          new Date() - new Date(tour.weather.lastUpdated) < 3 * 60 * 60 * 1000
        ) {
          setWeatherData(tour.weather);
          return;
        }

        // Otherwise fetch fresh weather data
        const data = await getTourWeather(tour._id);
        setWeatherData(data);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        // Don't set an error state here, as weather is not critical to the page
      } finally {
        setIsLoadingWeather(false);
      }
    };

    fetchWeatherData();
  }, [tour]);

  // Set up real-time availability checking
  useEffect(() => {
    if (!tour || !tour._id) return;

    // Function to check for availability updates
    const checkAvailability = async () => {
      try {
        setIsCheckingAvailability(true);
        const availabilityData = await getTourAvailability(tour._id);

        // Check if availability has changed
        let hasChanged = false;

        if (availabilityData && availabilityData.startDates) {
          // Compare current tour dates with fetched availability
          tour.startDates.forEach((currentDate, index) => {
            const updatedDate = availabilityData.startDates.find(
              d => new Date(d.date).toISOString() === new Date(currentDate.date).toISOString()
            );

            if (updatedDate && updatedDate.availableSeats !== currentDate.availableSeats) {
              hasChanged = true;
              // Update the tour data with new availability
              tour.startDates[index].availableSeats = updatedDate.availableSeats;
            }
          });

          if (hasChanged) {
            setAvailabilityUpdated(true);
            // Create a new tour object to trigger re-render
            setTour({...tour});

            // Show a notification about the update
            setActionMessage({
              text: 'Seat availability has been updated!',
              type: 'info'
            });

            // Clear the message after 3 seconds
            setTimeout(() => {
              setActionMessage({ text: '', type: '' });
            }, 3000);
          }
        }
      } catch (err) {
        console.error('Error checking availability:', err);
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    // Check availability immediately
    checkAvailability();

    // Set up interval to check availability every 30 seconds
    availabilityCheckIntervalRef.current = setInterval(checkAvailability, 30000);

    // Clean up interval on unmount
    return () => {
      if (availabilityCheckIntervalRef.current) {
        clearInterval(availabilityCheckIntervalRef.current);
      }
    };
  }, [tour?._id]);

  const [activeTab, setActiveTab] = useState('overview');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Handler for adding tour to cart
  const handleAddToCart = async () => {
    if (!token) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: `/tours/${id}` } });
      return;
    }

    if (!selectedDate) {
      setActionMessage({
        text: 'Please select a departure date',
        type: 'error'
      });
      return;
    }

    // Check if selected date has enough seats
    const selectedDateObj = tour.startDates.find(
      date => new Date(date.date).toISOString() === new Date(selectedDate).toISOString()
    );

    if (!selectedDateObj) {
      setActionMessage({
        text: 'Invalid date selected',
        type: 'error'
      });
      return;
    }

    if (selectedDateObj.availableSeats < travelers) {
      setActionMessage({
        text: `Not enough seats available. Only ${selectedDateObj.availableSeats} seats left.`,
        type: 'error'
      });
      return;
    }

    setIsAddingToCart(true);
    setActionMessage({ text: '', type: '' });

    try {
      // Format the date to match what the server expects (YYYY-MM-DD)
      const formattedDate = new Date(selectedDate).toISOString().split('T')[0];

      // Check if this tour is already in the cart with the same date
      const alreadyInCart = cart.items?.some(item =>
        item.tour._id === tour._id &&
        new Date(item.startDate).toISOString().split('T')[0] === formattedDate
      );

      if (alreadyInCart) {
        setActionMessage({
          text: 'This tour is already in your cart for the selected date',
          type: 'error'
        });
        setIsAddingToCart(false);
        return;
      }

      const result = await addToCart(tour._id, formattedDate, travelers);

      if (result.success) {
        // Update the local tour data to reflect the new availability
        const dateIndex = tour.startDates.findIndex(
          date => new Date(date.date).toISOString() === new Date(selectedDate).toISOString()
        );

        if (dateIndex !== -1) {
          // Create a new tour object with updated availability
          const updatedTour = {...tour};
          updatedTour.startDates[dateIndex].availableSeats -= travelers;
          setTour(updatedTour);
        }

        setActionMessage({
          text: 'Tour added to cart successfully!',
          type: 'success'
        });

        // Clear message after 3 seconds
        setTimeout(() => {
          setActionMessage({ text: '', type: '' });
        }, 3000);
      } else {
        setActionMessage({
          text: result.error || 'Failed to add tour to cart',
          type: 'error'
        });
      }
    } catch (err) {
      setActionMessage({
        text: 'An error occurred. Please try again.',
        type: 'error'
      });
      console.error('Error adding to cart:', err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handler for toggling wishlist status
  const handleWishlistToggle = async () => {
    if (!token) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: `/tours/${id}` } });
      return;
    }

    setIsAddingToWishlist(true);
    setActionMessage({ text: '', type: '' });

    try {
      let result;

      if (isInWishlist(tour._id)) {
        result = await removeFromWishlist(tour._id);
        if (result.success) {
          setActionMessage({
            text: 'Tour removed from wishlist',
            type: 'success'
          });
        }
      } else {
        result = await addToWishlist(tour._id);
        if (result.success) {
          setActionMessage({
            text: 'Tour added to wishlist!',
            type: 'success'
          });
        }
      }

      if (!result.success) {
        setActionMessage({
          text: result.error || 'Failed to update wishlist',
          type: 'error'
        });
      }

      // Clear message after 3 seconds
      setTimeout(() => {
        setActionMessage({ text: '', type: '' });
      }, 3000);
    } catch (err) {
      setActionMessage({
        text: 'An error occurred. Please try again.',
        type: 'error'
      });
      console.error('Error updating wishlist:', err);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Tour Not Found</h2>
        <p className="text-gray-700 mb-6">The tour you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full">
        <img
          src={tour.images[activeImageIndex]?.url || 'https://via.placeholder.com/1200x600?text=No+Image'}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6 md:p-12">
          <div className="container mx-auto">
            <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
              {tour.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{tour.title}</h1>
            <div className="flex items-center text-white mb-4">
              <span className="flex items-center mr-4">
                <span className="text-yellow-400 mr-1">★</span>
                {tour.rating.toFixed(1)} ({tour.totalReviews} reviews)
              </span>
              <span className="mr-4">|</span>
              <span className="mr-4">{tour.duration} days</span>
              <span className="mr-4">|</span>
              <span>{tour.destination}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Tour Details */}
          <div className="lg:w-2/3">
            {/* Navigation Tabs */}
            <div className="mb-8 border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('itinerary')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'itinerary'
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Itinerary
                </button>
                <button
                  onClick={() => setActiveTab('inclusions')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'inclusions'
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Inclusions
                </button>
                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'gallery'
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Gallery
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'reviews'
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Reviews ({tour.totalReviews})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Tour Overview</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">{tour.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-gray-500 text-sm">Duration</div>
                      <div className="font-semibold">{tour.duration} days</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-gray-500 text-sm">Group Size</div>
                      <div className="font-semibold">Max {tour.startDates[0]?.totalSeats || 'N/A'} people</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-gray-500 text-sm">Category</div>
                      <div className="font-semibold">{tour.category}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-gray-500 text-sm">Language</div>
                      <div className="font-semibold">English</div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-3">Highlights</h3>
                  <ul className="list-disc pl-5 mb-6 space-y-2 text-gray-700">
                    {tour.itinerary.slice(0, 3).map((day, index) => (
                      <li key={index}>{day.title}</li>
                    ))}
                    {tour.inclusions.slice(0, 2).map((inclusion, index) => (
                      <li key={`inc-${index}`}>{inclusion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Itinerary Tab */}
              {activeTab === 'itinerary' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Day by Day Itinerary</h2>
                  <div className="space-y-8">
                    {tour.itinerary.map((day, index) => (
                      <div key={index} className="relative pl-8 pb-8 border-l-2 border-emerald-200 last:border-0">
                        <div className="absolute left-[-8px] top-0 w-4 h-4 bg-emerald-500 rounded-full"></div>
                        <div className="mb-2">
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Day {day.day}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{day.title}</h3>
                        <p className="text-gray-700 mb-4">{day.description}</p>

                        {day.activities.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Activities:</h4>
                            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                              {day.activities.map((activity, actIndex) => (
                                <li key={actIndex}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm">
                          {day.accommodation && (
                            <div className="bg-gray-50 px-3 py-2 rounded">
                              <span className="font-medium">Accommodation:</span> {day.accommodation}
                            </div>
                          )}
                          {day.meals && day.meals.length > 0 && (
                            <div className="bg-gray-50 px-3 py-2 rounded">
                              <span className="font-medium">Meals:</span> {day.meals.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inclusions Tab */}
              {activeTab === 'inclusions' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">What's Included</h2>
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Included in the Package</h3>
                      <ul className="space-y-3">
                        {tour.inclusions.map((inclusion, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="w-5 h-5 text-emerald-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span className="text-gray-700">{inclusion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Not Included</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                          <span className="text-gray-700">International/domestic flights</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                          <span className="text-gray-700">Travel insurance</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                          <span className="text-gray-700">Personal expenses</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                          <span className="text-gray-700">Optional activities not mentioned in the itinerary</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Gallery Tab */}
              {activeTab === 'gallery' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Tour Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {tour.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg"
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <img
                          src={image.url}
                          alt={image.caption || `Tour image ${index + 1}`}
                          className={`w-full h-full object-cover transition duration-300 hover:scale-110 ${
                            activeImageIndex === index ? 'ring-4 ring-emerald-500' : ''
                          }`}
                        />
                        {image.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-sm">
                            {image.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <TourReviews tourId={tour._id} tourTitle={tour.title} />
              )}
            </div>
          </div>

          {/* Right Column - Booking & Info */}
          <div className="lg:w-1/3">
            {/* Pricing Card */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {formatPrice(tour.price.amount, tour.price.currency)}
                <span className="text-gray-500 text-base font-normal"> / person</span>
              </h3>

              {/* Availability Summary */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Dates:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {tour.startDates
                    .filter(date => new Date(date.date) > new Date()) // Only show future dates
                    .sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort by date
                    .slice(0, 3) // Show only next 3 dates
                    .map((date, index) => (
                      <div
                        key={index}
                        className={`text-sm p-2 rounded ${
                          date.availableSeats <= 0
                            ? 'bg-red-50 text-red-700'
                            : date.availableSeats < 5
                              ? 'bg-yellow-50 text-yellow-700'
                              : 'bg-green-50 text-green-700'
                        }`}
                      >
                        <span className="font-medium">
                          {new Date(date.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="float-right">
                          {date.availableSeats <= 0
                            ? 'Sold Out'
                            : `${date.availableSeats}/${date.totalSeats} available`}
                        </span>
                      </div>
                    ))
                  }
                </div>
                {tour.startDates.filter(date => new Date(date.date) > new Date() && date.availableSeats > 0).length > 3 && (
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    + {tour.startDates.filter(date => new Date(date.date) > new Date() && date.availableSeats > 0).length - 3} more dates available
                  </div>
                )}
              </div>

              {actionMessage.text && (
                <div className={`mb-4 p-3 rounded-lg ${
                  actionMessage.type === 'success' ? 'bg-green-100 text-green-800' :
                  actionMessage.type === 'info' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {actionMessage.text}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                  <span className="ml-2 text-xs text-gray-500">
                    (Updates automatically)
                  </span>
                </label>
                <div className="relative">
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  >
                    <option value="">Select a departure date</option>
                    {tour.startDates.map((dateOption, index) => (
                      <option
                        key={index}
                        value={dateOption.date}
                        disabled={dateOption.availableSeats <= 0}
                      >
                        {new Date(dateOption.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {dateOption.availableSeats <= 0
                          ? ' (SOLD OUT)'
                          : ` (${dateOption.availableSeats}/${dateOption.totalSeats} seats available)`}
                      </option>
                    ))}
                  </select>
                  {isCheckingAvailability && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-emerald-500 rounded-full border-t-transparent"></div>
                    </div>
                  )}
                </div>
                {availabilityUpdated && (
                  <div className="mt-2 text-xs text-emerald-600">
                    Availability information is up-to-date
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Travelers
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  value={travelers}
                  onChange={(e) => setTravelers(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'person' : 'people'}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className={`w-full py-3 px-4 rounded-lg font-medium transition duration-300 mb-4 ${
                  !selectedDate || isAddingToCart
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
                disabled={!selectedDate || isAddingToCart}
                onClick={handleAddToCart}
              >
                {isAddingToCart ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding to Cart...
                  </div>
                ) : (
                  'Add to Cart'
                )}
              </button>

              <button
                className={`w-full py-3 px-4 rounded-lg font-medium transition duration-300 ${
                  isAddingToWishlist
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-300'
                    : isInWishlist(tour._id)
                      ? 'bg-red-50 text-red-600 border border-red-600 hover:bg-red-100'
                      : 'bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-50'
                }`}
                disabled={isAddingToWishlist}
                onClick={handleWishlistToggle}
              >
                {isAddingToWishlist ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : isInWishlist(tour._id) ? (
                  'Remove from Wishlist'
                ) : (
                  'Add to Wishlist'
                )}
              </button>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tour Price ({travelers} {travelers === 1 ? 'person' : 'people'})</span>
                  <span className="font-medium">{formatPrice(tour.price.amount * travelers, tour.price.currency)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-medium">{formatPrice(Math.round(tour.price.amount * travelers * 0.1), tour.price.currency)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(Math.round(tour.price.amount * travelers * 1.1), tour.price.currency)}</span>
                </div>
              </div>
            </div>

            {/* Weather Info */}
            {weatherData ? (
              <WeatherDisplay weather={weatherData} className="mb-6" />
            ) : isLoadingWeather ? (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Weather at Destination</h3>
                <div className="flex items-center justify-center py-4">
                  <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : tour.weather ? (
              <WeatherDisplay weather={tour.weather} className="mb-6" />
            ) : null}

            {/* Map Location */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Location</h3>
              <div className="mb-3 overflow-hidden">
                <GoogleMap
                  location={tour.location}
                  destination={tour.destination}
                  height="250px"
                />
              </div>
              <div className="text-gray-700">{tour.destination}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetails;