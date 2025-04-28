import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchTours } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SearchForm } from './shared/SearchForm';
import { CategorySelector, categories } from './shared/CategorySelector';
import { TourCard } from './shared/TourCard';

const LandingPage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats] = useState({
    destinations: '500+',
    travelers: '100K+',
    experiences: '1000+',
    satisfaction: '98%'
  });

  // Fetch popular destinations
  useEffect(() => {
    const fetchPopularDestinations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { tours } = await searchTours({
          sortBy: 'rating',
          limit: 3
        });
        setPopularDestinations(tours);
      } catch (err) {
        setError('Failed to load popular destinations');
        console.error('Error fetching popular destinations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularDestinations();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams({
      destination: searchQuery,
      category: selectedCategory,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });
    navigate(`/search?${searchParams.toString()}`);
  };

  const benefits = [
    {
      title: 'Expert Local Guides',
      description: 'Connect with certified local experts who know every hidden gem',
      icon: '👤'
    },
    {
      title: 'Best Price Guarantee',
      description: 'We match any comparable price you find elsewhere',
      icon: '💰'
    },
    {
      title: 'Flexible Booking',
      description: 'Free cancellation up to 24 hours before your tour',
      icon: '📅'
    },
    {
      title: '24/7 Support',
      description: 'Round-the-clock assistance for peace of mind',
      icon: '🌟'
    }
  ];

  const travelTips = [
    {
      title: 'Pack Smart',
      tip: 'Roll clothes instead of folding to save space and prevent wrinkles',
      icon: '🎒'
    },
    {
      title: 'Local Currency',
      tip: 'Always carry some local currency for small purchases and emergencies',
      icon: '💵'
    },
    {
      title: 'Travel Insurance',
      tip: 'Never travel without comprehensive insurance coverage',
      icon: '🛡️'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[600px] bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1469474968028-56623f02e42e)' }}>
        <div className="absolute inset-0 bg-black bg-opacity-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-center items-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center">
              Discover Your Next Adventure
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-center max-w-2xl">
              Plan your perfect trip with our expert recommendations and real traveler reviews
            </p>

            {/* Enhanced Search Form */}
            <SearchForm
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              onSubmit={handleSearch}
              className="w-full max-w-4xl"
            />
          </div>
        </div>
      </div>

      {/* Travel Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-300">
                <div className="text-4xl font-bold text-emerald-600 mb-2">{value}</div>
                <div className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-8 text-center">Explore by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => {
              // Skip the "all" category
              if (category.id === 'all') return null;

              // Define category images
              const categoryImages = {
                'Beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
                'Mountain': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
                'City': 'https://images.unsplash.com/photo-1514565131-fce0801e5785',
                'Cultural': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
                'Adventure': 'https://images.unsplash.com/photo-1551632811-561732d1e306',
                'Wildlife': 'https://images.unsplash.com/photo-1546182990-dffeafbe841d'
              };

              return (
                <div
                  key={category.id}
                  onClick={() => navigate(`/search?category=${category.id}`)}
                  className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300"
                >
                  <div
                    className="h-40 bg-cover bg-center"
                    style={{ backgroundImage: `url(${categoryImages[category.id] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e'})` }}
                  >
                    <div className="h-full w-full bg-black bg-opacity-30 flex items-center justify-center">
                      <h3 className="text-white text-xl font-bold">{category.name}</h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Travel With Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition duration-300">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Popular Destinations</h2>
            <button
              onClick={() => navigate('/search?sortBy=rating')}
              className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center"
            >
              View All
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isLoading ? (
              [...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : popularDestinations.map((destination) => (
              <div
                key={destination._id}
                onClick={() => navigate(`/tours/${destination._id}`)}
                className="cursor-pointer transition-transform duration-300 hover:scale-105"
              >
                <TourCard
                  tour={destination}
                  variant="vertical"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Travel Tips Section */}
      <div className="bg-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Essential Travel Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {travelTips.map((tip, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition duration-300">
                <div className="text-4xl mb-4">{tip.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{tip.title}</h3>
                <p className="text-gray-600">{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-emerald-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Get Travel Inspiration</h2>
            <p className="text-lg mb-8">Subscribe to our newsletter for exclusive deals and travel tips</p>
            <form className="flex flex-col md:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-6 py-3 rounded-lg text-gray-900 w-full md:w-96"
              />
              <button
                type="submit"
                className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {token ? `Welcome${user ? ', ' + user.username : ''}!` : 'Ready to Start Your Journey?'}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {token
                ? 'Discover your next adventure and create unforgettable memories'
                : 'Join millions of travelers who plan their perfect trips with us'
              }
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {token ? (
                <>
                  <button
                    onClick={() => navigate('/search')}
                    className="bg-white text-emerald-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition duration-300"
                  >
                    Explore Tours
                  </button>
                  <button
                    onClick={() => navigate('/wishlist')}
                    className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white hover:bg-opacity-10 transition duration-300"
                  >
                    View Wishlist
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/register')}
                    className="bg-white text-emerald-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition duration-300"
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white hover:bg-opacity-10 transition duration-300"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;