import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const UserProfile = () => {
  const { token, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setFormData({
        username: response.data.username,
        email: response.data.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch user profile');
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await api.get('/users/me/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateSuccess('');
    setUpdateError('');

    // Validate passwords if trying to change password
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setUpdateError('New passwords do not match');
        return;
      }
      if (!formData.currentPassword) {
        setUpdateError('Current password is required to set a new password');
        return;
      }
    }

    try {
      const updateData = {
        username: formData.username,
        email: formData.email
      };

      if (formData.newPassword && formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await api.put('/users/me', updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data);
      setUpdateSuccess('Profile updated successfully');
      setIsEditing(false);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    const password = window.prompt('Please enter your password to confirm account deletion:');
    if (!password) return;

    try {
      await api.delete('/users/me', {
        headers: { Authorization: `Bearer ${token}` },
        data: { password }
      });
      
      logout();
      // Redirect will happen automatically due to logout
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete account');
      console.error('Error deleting account:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Account Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Edit
                </button>
              )}
            </div>
            
            {updateSuccess && (
              <div className="m-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <p>{updateSuccess}</p>
              </div>
            )}
            
            {updateError && (
              <div className="m-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{updateError}</p>
              </div>
            )}
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="p-4">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-md font-medium mb-2">Change Password</h3>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        username: user.username,
                        email: user.email,
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setUpdateError('');
                    }}
                    className="mr-2 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4">
                <div className="mb-4">
                  <p className="text-gray-500 text-sm">Username</p>
                  <p className="font-medium">{user.username}</p>
                </div>
                <div className="mb-4">
                  <p className="text-gray-500 text-sm">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div className="mb-4">
                  <p className="text-gray-500 text-sm">Member Since</p>
                  <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Account Actions</h2>
            </div>
            <div className="p-4">
              <button
                onClick={handleDeleteAccount}
                className="text-red-600 hover:text-red-800"
              >
                Delete Account
              </button>
              <p className="text-gray-500 text-sm mt-1">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Your Travel Stats</h2>
            </div>
            {stats ? (
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-2xl font-bold text-indigo-600">{stats.totalTrips}</p>
                    <p className="text-gray-500 text-sm">Total Trips</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-2xl font-bold text-indigo-600">{stats.countriesVisited}</p>
                    <p className="text-gray-500 text-sm">Countries</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-2xl font-bold text-indigo-600">{stats.reviewsWritten}</p>
                    <p className="text-gray-500 text-sm">Reviews</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-2xl font-bold text-indigo-600">{stats.upcomingTrips}</p>
                    <p className="text-gray-500 text-sm">Upcoming</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-500 text-sm">Favorite Destination</p>
                  <p className="font-medium">{stats.favoriteDestination}</p>
                </div>
                <div className="mt-2">
                  <p className="text-gray-500 text-sm">Total Distance Traveled</p>
                  <p className="font-medium">{stats.totalDistance.toLocaleString()} km</p>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                Loading stats...
              </div>
            )}
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Quick Links</h2>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link to="/bookings" className="text-indigo-600 hover:text-indigo-800">
                    Your Bookings
                  </Link>
                </li>
                <li>
                  <Link to="/reviews" className="text-indigo-600 hover:text-indigo-800">
                    Your Reviews
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="text-indigo-600 hover:text-indigo-800">
                    Your Wishlist
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
