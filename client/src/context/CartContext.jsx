import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // Fetch cart when user logs in or clear it when user logs out
  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      // Clear cart when user is not logged in
      setCart({ items: [] });
      setError(null);
      console.log('User not logged in, cart cleared');
    }
  }, [token]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cart');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (tourId, startDate, travelers) => {
    try {
      // Check if user is logged in
      if (!token) {
        setError('Please log in to add items to your cart');
        console.error('Attempted to add to cart while not logged in');
        return { success: false, error: 'Please log in to add items to your cart' };
      }

      setLoading(true);
      const response = await api.post('/cart/add',
        { tourId, startDate, travelers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data);
      setError(null);
      return { success: true };
    } catch (err) {
      // Handle unauthorized error specifically
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        setCart({ items: [] }); // Clear cart on auth error
        return { success: false, error: 'Your session has expired. Please log in again.' };
      }

      setError(err.response?.data?.message || 'Failed to add to cart');
      console.error('Error adding to cart:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to add to cart' };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, travelers) => {
    try {
      console.log('Updating cart item:', { itemId, travelers });
      console.log('Item ID type:', typeof itemId);
      console.log('Current cart state before update:', cart);

      // Check if user is logged in
      if (!token) {
        setError('Please log in to update your cart');
        console.error('Attempted to update cart while not logged in');
        return { success: false, error: 'Please log in to update your cart' };
      }

      setLoading(true);

      // Validate inputs
      if (!itemId) {
        console.error('Invalid item ID:', itemId);
        setError('Invalid item ID');
        return { success: false, error: 'Invalid item ID' };
      }

      if (!travelers || travelers < 1) {
        console.error('Invalid travelers count:', travelers);
        setError('Invalid travelers count');
        return { success: false, error: 'Invalid travelers count' };
      }

      // Ensure itemId is a string
      const itemIdStr = String(itemId);
      console.log('Using item ID (as string):', itemIdStr);

      try {
        // First, make a local update to the cart to ensure UI responsiveness
        const updatedCart = { ...cart };
        const itemIndex = updatedCart.items.findIndex(item => item._id === itemId);

        if (itemIndex !== -1) {
          console.log('Item found in local cart at index:', itemIndex);
          // Create a new array with the updated item
          const updatedItems = [...updatedCart.items];
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            travelers: travelers
          };
          updatedCart.items = updatedItems;

          // Update the local state immediately for better UX
          setCart(updatedCart);
          console.log('Local cart updated:', updatedCart);
        } else {
          console.log('Item not found in local cart');
        }

        // Send the update to the server
        const response = await api.put(`/cart/update/${itemIdStr}`,
          { travelers },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Cart update response:', response.data);

        // Verify the response has items before updating the cart
        if (response.data && Array.isArray(response.data.items)) {
          console.log('Server returned valid cart with items:', response.data.items.length);
          setCart(response.data);
        } else {
          console.warn('Server returned cart with no items or invalid format:', response.data);
          // If the server response is empty or invalid, fetch the latest cart
          await fetchCart();
        }

        setError(null);
        return { success: true };
      } catch (err) {
        console.error('Error updating cart:', err);
        console.error('Error details:', {
          status: err.response?.status,
          message: err.response?.data?.message,
          itemId,
          travelers
        });

        // Handle unauthorized error
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          setCart({ items: [] }); // Clear cart on auth error
          return { success: false, error: 'Your session has expired. Please log in again.' };
        }

        // If we get a 404, the cart or item doesn't exist
        // Let's fetch the cart to get the latest state
        if (err.response?.status === 404) {
          console.log('Cart or item not found, fetching latest cart state');
          await fetchCart();
          return { success: true, message: 'Item updated or not found in cart' };
        }

        throw err; // Re-throw for the outer catch block
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update cart');
      // Fetch the latest cart state to ensure UI is in sync
      await fetchCart();
      return { success: false, error: err.response?.data?.message || 'Failed to update cart' };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      console.log('Removing from cart:', { itemId });
      console.log('Item ID type:', typeof itemId);

      // Check if user is logged in
      if (!token) {
        setError('Please log in to remove items from your cart');
        console.error('Attempted to remove from cart while not logged in');
        return { success: false, error: 'Please log in to remove items from your cart' };
      }

      setLoading(true);

      // Validate input
      if (!itemId) {
        console.error('Invalid item ID:', itemId);
        setError('Invalid item ID');
        return { success: false, error: 'Invalid item ID' };
      }

      // Ensure itemId is a string
      const itemIdStr = String(itemId);
      console.log('Using item ID (as string):', itemIdStr);

      try {
        const response = await api.delete(`/cart/remove/${itemIdStr}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Cart remove response:', response.data);
        setCart(response.data);
        setError(null);
        return { success: true };
      } catch (err) {
        console.error('Error removing from cart:', err);
        console.error('Error details:', {
          status: err.response?.status,
          message: err.response?.data?.message,
          itemId
        });

        // Handle unauthorized error
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          setCart({ items: [] }); // Clear cart on auth error
          return { success: false, error: 'Your session has expired. Please log in again.' };
        }

        // If we get a 404, the cart or item doesn't exist
        // Let's fetch the cart to get the latest state
        if (err.response?.status === 404) {
          console.log('Cart or item not found, fetching latest cart state');
          await fetchCart();
          return { success: true, message: 'Item removed or not found in cart' };
        }

        throw err; // Re-throw for the outer catch block
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove from cart');
      return { success: false, error: err.response?.data?.message || 'Failed to remove from cart' };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      // If user is not logged in, just clear the local cart state
      if (!token) {
        setCart({ items: [] });
        setError(null);
        console.log('User not logged in, local cart cleared');
        return { success: true };
      }

      setLoading(true);
      try {
        await api.delete('/cart/clear', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCart({ items: [] });
        setError(null);
        return { success: true };
      } catch (err) {
        // Handle unauthorized error
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          setCart({ items: [] }); // Clear cart on auth error
          return { success: false, error: 'Your session has expired. Please log in again.' };
        }
        throw err; // Re-throw for the outer catch block
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear cart');
      console.error('Error clearing cart:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to clear cart' };
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (couponCode) => {
    try {
      console.log('Applying coupon code:', couponCode);

      // Check if user is logged in
      if (!token) {
        setError('Please log in to apply a coupon');
        console.error('Attempted to apply coupon while not logged in');
        return { success: false, error: 'Please log in to apply a coupon' };
      }

      setLoading(true);
      try {
        const response = await api.post('/cart/apply-coupon',
          { couponCode },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Make sure the coupon code is in uppercase to match our discount logic
        const updatedCart = {
          ...response.data,
          couponCode: couponCode.toUpperCase()
        };

        console.log('Cart after applying coupon:', updatedCart);
        setCart(updatedCart);
        setError(null);
        return { success: true };
      } catch (err) {
        // Handle unauthorized error
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          setCart({ items: [] }); // Clear cart on auth error
          return { success: false, error: 'Your session has expired. Please log in again.' };
        }
        throw err; // Re-throw for the outer catch block
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply coupon');
      console.error('Error applying coupon:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to apply coupon' };
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = cart.items.reduce((total, item) => {
      return total + (item.price.amount * item.travelers);
    }, 0);

    // In a real application, the discount would be calculated on the server
    // For now, we'll simulate a discount calculation
    if (cart.couponCode) {
      console.log('Applying coupon:', cart.couponCode);
      console.log('Subtotal before discount:', subtotal);

      let discountedTotal = subtotal;

      // Apply a simple discount based on the coupon code
      if (cart.couponCode === 'WELCOME10') {
        discountedTotal = subtotal * 0.9; // 10% off
      } else if (cart.couponCode === 'SUMMER2023' && subtotal >= 1000) {
        discountedTotal = subtotal * 0.85; // 15% off
      } else if (cart.couponCode === 'FIXED50' && subtotal >= 500) {
        discountedTotal = subtotal - 50; // $50 off
      } else if (cart.couponCode === 'FAMILY25' && subtotal >= 2000) {
        discountedTotal = subtotal * 0.75; // 25% off
      }

      console.log('Discounted total:', discountedTotal);
      console.log('Discount amount:', subtotal - discountedTotal);

      return discountedTotal;
    }

    return subtotal;
  };

  const getItemCount = () => {
    return cart.items.length;
  };

  const value = {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    calculateTotal,
    getItemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
