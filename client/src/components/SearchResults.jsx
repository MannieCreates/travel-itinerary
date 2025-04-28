import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchTours } from '../services/api';
import { SearchForm } from './shared/SearchForm';
import { TourCard } from './shared/TourCard';
import { categories } from './shared/CategorySelector';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  // Search parameters
  const [searchQuery, setSearchQuery] = useState(queryParams.get('destination') || '');
  const [selectedCategory, setSelectedCategory] = useState(queryParams.get('category') || 'all');
  const [startDate, setStartDate] = useState(queryParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(queryParams.get('endDate') || '');

  // Check for sortBy in URL
  useEffect(() => {
    const sortParam = queryParams.get('sortBy');
    if (sortParam) {
      setSortBy(sortParam);
    }
  }, []);

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [duration, setDuration] = useState('any');
  const [rating, setRating] = useState(0);
  const [sortBy, setSortBy] = useState('recommended');

  // API states
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'all', name: 'All', icon: '🌎' },
    { id: 'Beach', name: 'Beaches', icon: '🏖' },
    { id: 'Mountain', name: 'Mountains', icon: '⛰' },
    { id: 'City', name: 'Cities', icon: '🌆' },
    { id: 'Cultural', name: 'Cultural', icon: '🏛' },
    { id: 'Adventure', name: 'Adventure', icon: '🏃' },
    { id: 'Wildlife', name: 'Wildlife', icon: '🦁' },
  ];

  // Duration options
  const durationOptions = [
    { value: 'any', label: 'Any Duration' },
    { value: '1-3', label: '1-3 Days' },
    { value: '4-7', label: '4-7 Days' },
    { value: '8-14', label: '8-14 Days' },
    { value: '15+', label: '15+ Days' },
  ];

  // Sort options
  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'duration', label: 'Duration' },
  ];

  // We don't need to define today here as it's handled in the SearchForm component

  const fetchTours = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        ...(searchQuery && { destination: searchQuery }),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(priceRange[0] > 0 && { minPrice: priceRange[0] }),
        ...(priceRange[1] < 5000 && { maxPrice: priceRange[1] }),
        ...(sortBy !== 'recommended' && { sortBy }),
      };

      const { tours } = await searchTours(params);
      setTours(tours);
    } catch (err) {
      setError(err.message || 'Failed to fetch tours');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tours when search parameters change
  useEffect(() => {
    fetchTours();
  }, [searchQuery, selectedCategory, startDate, endDate, priceRange, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();

    if (searchQuery) searchParams.set('destination', searchQuery);
    if (selectedCategory !== 'all') searchParams.set('category', selectedCategory);
    if (startDate) searchParams.set('startDate', startDate);
    if (endDate) searchParams.set('endDate', endDate);
    if (sortBy !== 'recommended') searchParams.set('sortBy', sortBy);

    navigate(`/search?${searchParams.toString()}`);
    fetchTours();
  };

  // Apply client-side filters and sorting
  useEffect(() => {
    let results = [...tours];

    // Filter by duration
    if (duration !== 'any') {
      const [min, max] = duration.split('-').map(Number);
      results = results.filter(tour => {
        if (duration === '15+') return tour.duration >= 15;
        return tour.duration >= min && tour.duration <= max;
      });
    }

    // Filter by rating
    if (rating > 0) {
      results = results.filter(tour => tour.rating >= rating);
    }

    // Apply sorting
    results.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price.amount - b.price.amount;
        case 'price-high':
          return b.price.amount - a.price.amount;
        case 'rating':
          return b.rating - a.rating;
        case 'duration':
          return b.duration - a.duration;
        default:
          return (b.rating * b.totalReviews) - (a.rating * a.totalReviews);
      }
    });

    setFilteredTours(results);
  }, [tours, duration, rating, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Section */}
      <div className="bg-emerald-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Summary */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {searchQuery ? `Tours in ${searchQuery}` : 'All Tours'}
          </h1>
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            {searchQuery && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                📍 {searchQuery}
              </span>
            )}
            {startDate && endDate && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                📅 {startDate} - {endDate}
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                🏷 {categories.find(cat => cat.id === selectedCategory)?.name || selectedCategory}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range ($)
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {durationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <div className="flex gap-2">
                  {[0, 3, 3.5, 4, 4.5].map(value => (
                    <button
                      key={value}
                      onClick={() => setRating(value)}
                      className={`flex-1 py-2 text-sm rounded ${
                        rating === value
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-500'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {value === 0 ? 'Any' : value}★
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            {/* Sort Controls */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {filteredTours.length} tours found
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tour Cards */}
            <div className="space-y-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
                  <p className="mt-2 text-gray-600">Loading tours...</p>
                </div>
              ) : filteredTours.length > 0 ? (
                filteredTours.map(tour => (
                  <TourCard
                    key={tour._id}
                    tour={tour}
                    variant="horizontal"
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No tours found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your filters or search criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;