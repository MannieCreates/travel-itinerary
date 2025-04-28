import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Tours = () => {
  const { token } = useAuth();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchTours();
  }, [currentPage, token]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage);
      if (searchTerm) params.append('destination', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await api.get(`/tours/search?${params.toString()}`);
      setTours(response.data.tours);
      setTotalPages(Math.ceil(response.data.count / 10)); // Assuming 10 items per page
    } catch (err) {
      console.error('Error fetching tours:', err);
      setError('Failed to load tours. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTours();
  };

  const formatPrice = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading && tours.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Tours Management</h2>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <form onSubmit={handleSearch} className="flex w-full md:w-auto">
            <input
              type="text"
              placeholder="Search destinations..."
              className="px-4 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="bg-indigo-500 text-white px-4 py-2 rounded-r hover:bg-indigo-600"
            >
              Search
            </button>
          </form>
          
          <select
            className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Categories</option>
            <option value="Adventure">Adventure</option>
            <option value="Cultural">Cultural</option>
            <option value="Beach">Beach</option>
            <option value="Mountain">Mountain</option>
            <option value="City">City</option>
            <option value="Wildlife">Wildlife</option>
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setCurrentPage(1);
              fetchTours();
            }}
            className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tour
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tours.length > 0 ? (
                tours.map((tour) => (
                  <tr key={tour._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={tour.images[0]?.url || 'https://via.placeholder.com/150'}
                            alt={tour.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{tour.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tour.destination}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {tour.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(tour.price.amount, tour.price.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tour.duration} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tour.rating.toFixed(1)} ({tour.totalReviews})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => window.open(`/tours/${tour._id}`, '_blank')}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No tours found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-l ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
              }`}
            >
              Previous
            </button>
            <div className="px-4 py-1 bg-white text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-r ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
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

export default Tours;
