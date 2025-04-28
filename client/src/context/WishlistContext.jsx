import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState({ tours: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // Fetch wishlist when user logs in
  useEffect(() => {
    if (token) {
      fetchWishlist();
    } else {
      setWishlist({ tours: [] });
    }
  }, [token]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch wishlist');
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (tourId) => {
    try {
      setLoading(true);
      const response = await api.post(`/wishlist/add/${tourId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(response.data);
      setError(null);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to wishlist');
      console.error('Error adding to wishlist:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to add to wishlist' };
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (tourId) => {
    try {
      setLoading(true);
      const response = await api.delete(`/wishlist/remove/${tourId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(response.data);
      setError(null);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove from wishlist');
      console.error('Error removing from wishlist:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to remove from wishlist' };
    } finally {
      setLoading(false);
    }
  };

  const clearWishlist = async () => {
    try {
      setLoading(true);
      await api.delete('/wishlist/clear', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist({ tours: [] });
      setError(null);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear wishlist');
      console.error('Error clearing wishlist:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to clear wishlist' };
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (tourId) => {
    return wishlist.tours.some(tour => 
      typeof tour === 'object' 
        ? tour._id === tourId 
        : tour === tourId
    );
  };

  const getWishlistCount = () => {
    return wishlist.tours.length;
  };

  const value = {
    wishlist,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
