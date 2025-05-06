import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

const Cart = () => {
  const { cart, loading, error, updateCartItem, removeFromCart, clearCart, applyCoupon, calculateTotal } = useCart();
  const { formatPrice } = useCurrency();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Reset messages when cart changes
    setCouponError('');
    setCouponSuccess('');

    // Debug cart items
    if (cart && cart.items) {
      console.log('Cart items:', cart.items.map(item => ({
        id: item._id,
        idType: typeof item._id,
        tour: item.tour?.title || item.tour,
        travelers: item.travelers,
        startDate: item.startDate
      })));
    }
  }, [cart]);

  const handleQuantityChange = async (itemId, travelers) => {
    if (travelers < 1) return;
    console.log('Changing quantity for item:', itemId, 'to', travelers);

    try {
      const result = await updateCartItem(itemId, travelers);
      console.log('Update result:', result);

      if (!result.success) {
        // Show error message to user
        alert(result.error || 'Failed to update quantity');
      } else if (result.message) {
        // Show success message with additional info
        console.log(result.message);
      }
    } catch (err) {
      console.error('Error in handleQuantityChange:', err);
      alert('An unexpected error occurred while updating the cart');
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      try {
        console.log('Removing item from cart:', itemId);
        const result = await removeFromCart(itemId);
        console.log('Remove result:', result);

        if (!result.success) {
          // Show error message to user
          alert(result.error || 'Failed to remove item from cart');
        } else if (result.message) {
          // Show success message with additional info
          console.log(result.message);
        }
      } catch (err) {
        console.error('Error in handleRemoveItem:', err);
        alert('An unexpected error occurred while removing the item from cart');
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponError('');
    setCouponSuccess('');

    const result = await applyCoupon(couponCode);
    if (result.success) {
      setCouponSuccess('Coupon applied successfully!');
    } else {
      setCouponError(result.error || 'Failed to apply coupon');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
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

  // Calculate the raw subtotal without any discounts
  const calculateRawSubtotal = () => {
    const rawSubtotal = cart.items.reduce((total, item) => {
      return total + (item.price.amount * item.travelers);
    }, 0);
    console.log('Raw subtotal:', rawSubtotal);
    return rawSubtotal;
  };

  // Get the total after any discounts
  const subtotal = calculateTotal();
  console.log('Subtotal after discount:', subtotal);

  // Calculate the discount amount
  const discountAmount = cart.couponCode ? calculateRawSubtotal() - subtotal : 0;
  console.log('Discount amount:', discountAmount);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Cart Items ({cart.items.length})</h2>
            </div>

            <ul className="divide-y divide-gray-200">
              {cart.items.map((item) => (
                <li key={item._id} className="p-4">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-24 h-24 mb-4 sm:mb-0">
                      <img
                        src={item.tour.images[0]?.url || 'https://via.placeholder.com/150'}
                        alt={item.tour.title}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 sm:ml-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            <Link to={`/tours/${item.tour._id}`} className="hover:text-indigo-600">
                              {item.tour.title}
                            </Link>
                          </h3>
                          <p className="text-gray-500 text-sm">{item.tour.destination}</p>
                          <p className="text-gray-500 text-sm">
                            Start Date: {new Date(item.startDate).toLocaleDateString()}
                          </p>
                          <p className="text-gray-500 text-sm">
                            Duration: {item.tour.duration} days
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0">
                          <p className="font-medium text-gray-900">
                            {formatPrice(item.price.amount * item.travelers, item.price.currency)}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {formatPrice(item.price.amount, item.price.currency)} per person
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <button
                            onClick={() => {
                              console.log('Decrease button clicked for item:', item._id);
                              console.log('Item ID type:', typeof item._id);
                              handleQuantityChange(item._id, item.travelers - 1);
                            }}
                            className="text-gray-500 focus:outline-none focus:text-gray-600 p-1"
                            disabled={item.travelers <= 1}
                          >
                            <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M20 12H4"></path>
                            </svg>
                          </button>
                          <span className="mx-2 text-gray-700">{item.travelers}</span>
                          <button
                            onClick={() => {
                              console.log('Increase button clicked for item:', item._id);
                              console.log('Item ID type:', typeof item._id);
                              handleQuantityChange(item._id, item.travelers + 1);
                            }}
                            className="text-gray-500 focus:outline-none focus:text-gray-600 p-1"
                          >
                            <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M12 4v16m8-8H4"></path>
                            </svg>
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            console.log('Remove button clicked for item:', item._id);
                            console.log('Item ID type:', typeof item._id);
                            handleRemoveItem(item._id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="p-4 border-t">
              <button
                onClick={handleClearCart}
                className="text-red-500 hover:text-red-700"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(calculateRawSubtotal())}</span>
              </div>
              {cart.couponCode && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Coupon ({cart.couponCode})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-r hover:bg-gray-300"
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="text-red-500 text-sm mt-1">{couponError}</p>
              )}
              {couponSuccess && (
                <p className="text-green-500 text-sm mt-1">{couponSuccess}</p>
              )}

              <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
                <p className="text-blue-800 font-medium mb-1">💡 Available Coupon Codes</p>
                <ul className="text-blue-700 space-y-1">
                  <li><span className="font-medium">WELCOME10</span> - 10% off any booking</li>
                  <li><span className="font-medium">SUMMER2023</span> - 15% off bookings over $1000</li>
                  <li><span className="font-medium">FIXED50</span> - $50 off bookings over $500</li>
                  <li><span className="font-medium">FAMILY25</span> - 25% off bookings over $2000</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Proceed to Checkout
            </button>

            <div className="mt-4 text-center">
              <Link
                to="/search"
                className="text-indigo-600 hover:text-indigo-800"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
