import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTourById } from '../services/api';

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const [activeTab, setActiveTab] = useState('overview');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
            </div>
          </div>

          {/* Right Column - Booking & Info */}
          <div className="lg:w-1/3">
            {/* Pricing Card */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 sticky top-20">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                ${tour.price.amount}
                <span className="text-gray-500 text-base font-normal"> / person</span>
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500">
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
                      {dateOption.availableSeats <= 0 ? ' (Sold Out)' : ` (${dateOption.availableSeats} seats left)`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Travelers
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'person' : 'people'}
                    </option>
                  ))}
                </select>
              </div>

              <button className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition duration-300 mb-4">
                Book Now
              </button>

              <button className="w-full bg-white text-emerald-600 py-3 px-4 rounded-lg font-medium border border-emerald-600 hover:bg-emerald-50 transition duration-300">
                Add to Wishlist
              </button>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tour Price</span>
                  <span className="font-medium">${tour.price.amount}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-medium">${Math.round(tour.price.amount * 0.1)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span>${Math.round(tour.price.amount * 1.1)}</span>
                </div>
              </div>
            </div>

            {/* Weather Info */}
            {tour.weather && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Weather at Destination</h3>
                <div className="flex items-center">
                  <div className="mr-4">
                    <span className="text-4xl font-bold">{tour.weather.temperature}°</span>
                  </div>
                  <div>
                    <div className="font-medium">{tour.weather.condition}</div>
                    <div className="text-sm text-gray-500">
                      Last updated: {new Date(tour.weather.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Map Location */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Location</h3>
              <div className="aspect-video bg-gray-200 rounded-lg mb-3 overflow-hidden">
                {/* Placeholder for map - in a real app, you'd use Google Maps or similar */}
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-500">Map of {tour.destination}</span>
                </div>
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