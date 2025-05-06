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
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    duration: 1,
    price: {
      amount: 0,
      currency: 'USD'
    },
    category: 'Adventure',
    inclusions: [],
    startDates: []
  });

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

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (name.startsWith('price.')) {
      const priceField = name.split('.')[1];
      setFormData({
        ...formData,
        price: {
          ...formData.price,
          [priceField]: type === 'number' ? parseFloat(value) : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'number' ? parseFloat(value) : value
      });
    }
  };

  const handleInclusionChange = (e) => {
    const value = e.target.value;
    const inclusions = value.split('\n').filter(item => item.trim() !== '');
    setFormData({
      ...formData,
      inclusions
    });
  };

  const handleDateAdd = () => {
    const newDate = {
      date: new Date().toISOString().split('T')[0],
      availableSeats: 10,
      totalSeats: 10
    };

    setFormData({
      ...formData,
      startDates: [...formData.startDates, newDate]
    });
  };

  const handleDateChange = (index, field, value) => {
    const updatedDates = [...formData.startDates];
    updatedDates[index] = {
      ...updatedDates[index],
      [field]: field === 'date' ? value : parseInt(value)
    };

    setFormData({
      ...formData,
      startDates: updatedDates
    });
  };

  const handleDateRemove = (index) => {
    const updatedDates = formData.startDates.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      startDates: updatedDates
    });
  };

  const handleEdit = (tour) => {
    setEditingId(tour._id);
    setFormData({
      title: tour.title,
      description: tour.description,
      destination: tour.destination,
      duration: tour.duration,
      price: {
        amount: tour.price.amount,
        currency: tour.price.currency
      },
      category: tour.category,
      inclusions: tour.inclusions || [],
      startDates: tour.startDates.map(date => ({
        date: new Date(date.date).toISOString().split('T')[0],
        availableSeats: date.availableSeats,
        totalSeats: date.totalSeats
      }))
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tour?')) return;

    try {
      await api.delete(`/admin/tours/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTours();
    } catch (err) {
      console.error('Error deleting tour:', err);
      setError('Failed to delete tour. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const tourData = {
        ...formData,
        price: {
          amount: parseFloat(formData.price.amount),
          currency: formData.price.currency
        },
        duration: parseInt(formData.duration)
      };

      if (editingId) {
        await api.put(`/admin/tours/${editingId}`, tourData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post('/admin/tours', tourData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchTours();
    } catch (err) {
      console.error('Error saving tour:', err);
      setError('Failed to save tour. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      destination: '',
      duration: 1,
      price: {
        amount: 0,
        currency: 'USD'
      },
      category: 'Adventure',
      inclusions: [],
      startDates: []
    });
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
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Tours Management</h2>
          <button
            onClick={() => {
              resetForm();
              setEditingId(null);
              setShowModal(true);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add New Tour
          </button>
        </div>

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
                      <button
                        onClick={() => handleEdit(tour)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tour._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
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

      {/* Modal for adding/editing tours */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingId ? 'Edit Tour' : 'Add New Tour'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title*
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destination*
                    </label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description*
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (days)*
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price*
                    </label>
                    <input
                      type="number"
                      name="price.amount"
                      value={formData.price.amount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      name="price.currency"
                      value={formData.price.currency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Adventure">Adventure</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Beach">Beach</option>
                    <option value="Mountain">Mountain</option>
                    <option value="City">City</option>
                    <option value="Wildlife">Wildlife</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inclusions (one per line)
                  </label>
                  <textarea
                    value={formData.inclusions.join('\n')}
                    onChange={handleInclusionChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                    placeholder="Hotel accommodation&#10;Breakfast&#10;Tour guide"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Available Dates
                    </label>
                    <button
                      type="button"
                      onClick={handleDateAdd}
                      className="px-2 py-1 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600"
                    >
                      Add Date
                    </button>
                  </div>

                  {formData.startDates.length > 0 ? (
                    <div className="space-y-2">
                      {formData.startDates.map((dateObj, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                          <div className="flex-grow grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs text-gray-500">Date</label>
                              <input
                                type="date"
                                value={dateObj.date}
                                onChange={(e) => handleDateChange(index, 'date', e.target.value)}
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500">Available Seats</label>
                              <input
                                type="number"
                                value={dateObj.availableSeats}
                                onChange={(e) => handleDateChange(index, 'availableSeats', e.target.value)}
                                className="w-full px-2 py-1 border rounded text-sm"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500">Total Seats</label>
                              <input
                                type="number"
                                value={dateObj.totalSeats}
                                onChange={(e) => handleDateChange(index, 'totalSeats', e.target.value)}
                                className="w-full px-2 py-1 border rounded text-sm"
                                min="1"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDateRemove(index)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No dates added yet</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded text-gray-700 mr-2 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Tour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tours;
