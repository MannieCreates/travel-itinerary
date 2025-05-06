import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Checkout = () => {
  const { cart, loading, error, calculateTotal, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [billingInfo, setBillingInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: ''
  });
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    reference: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const handleBillingInfoChange = (e) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleCardInfoChange = (e) => {
    const { name, value } = e.target;
    setCardInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleBankInfoChange = (e) => {
    const { name, value } = e.target;
    setBankInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPaymentError('');

    // Basic validation
    if (!billingInfo.name || !billingInfo.email || !billingInfo.address || !billingInfo.city ||
        !billingInfo.country || !billingInfo.phone) {
      setPaymentError('Please fill in all required billing fields');
      return;
    }

    if (paymentMethod === 'credit_card') {
      if (!cardInfo.cardNumber || !cardInfo.cardName || !cardInfo.expiryDate || !cardInfo.cvv) {
        setPaymentError('Please fill in all card details');
        return;
      }
    } else if (paymentMethod === 'bank_transfer') {
      if (!bankInfo.bankName || !bankInfo.accountName || !bankInfo.accountNumber || !bankInfo.routingNumber) {
        setPaymentError('Please fill in all bank details');
        return;
      }
    }

    try {
      setIsProcessing(true);

      // Prepare payment details
      let paymentDetails = {};

      if (paymentMethod === 'credit_card') {
        paymentDetails = {
          cardLast4: cardInfo.cardNumber.slice(-4),
          cardBrand: getCardBrand(cardInfo.cardNumber),
          expiryDate: cardInfo.expiryDate
        };
      } else if (paymentMethod === 'bank_transfer') {
        paymentDetails = {
          bankName: bankInfo.bankName,
          accountName: bankInfo.accountName,
          accountNumber: bankInfo.accountNumber,
          routingNumber: bankInfo.routingNumber,
          reference: bankInfo.reference || billingInfo.name,
          bankReference: `BNK-${Date.now().toString().slice(-6)}`
        };
      }

      // Process payment
      const response = await api.post('/payments/process-cart', {
        paymentMethod,
        paymentDetails,
        billingAddress: billingInfo,
        couponCode: cart.couponCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Clear cart after successful payment
      await clearCart();

      // Redirect to confirmation page
      navigate('/bookings', {
        state: {
          success: true,
          message: 'Payment processed successfully!',
          bookings: response.data.bookings
        }
      });
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Payment processing failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getCardBrand = (cardNumber) => {
    // Very basic card brand detection
    const firstDigit = cardNumber.charAt(0);
    const firstTwoDigits = cardNumber.substring(0, 2);

    if (firstDigit === '4') return 'Visa';
    if (['51', '52', '53', '54', '55'].includes(firstTwoDigits)) return 'MasterCard';
    if (['34', '37'].includes(firstTwoDigits)) return 'American Express';
    if (['60', '65'].includes(firstTwoDigits)) return 'Discover';
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/search')}
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Browse Tours
          </button>
        </div>
      </div>
    );
  }

  // Calculate the raw subtotal without any discounts
  const calculateSubtotal = () => {
    const rawSubtotal = cart.items.reduce((total, item) => {
      return total + (item.price.amount * item.travelers);
    }, 0);
    console.log('Checkout - Raw subtotal:', rawSubtotal);
    return rawSubtotal;
  };

  // Get the total after any discounts
  const subtotal = calculateTotal();
  console.log('Checkout - Subtotal after discount:', subtotal);

  // Calculate the discount amount
  const discountAmount = cart.couponCode ? calculateSubtotal() - subtotal : 0;
  console.log('Checkout - Discount amount:', discountAmount);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Billing Information</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={billingInfo.name}
                      onChange={handleBillingInfoChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={billingInfo.email}
                      onChange={handleBillingInfoChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={billingInfo.address}
                      onChange={handleBillingInfoChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={billingInfo.city}
                      onChange={handleBillingInfoChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={billingInfo.state}
                      onChange={handleBillingInfoChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={billingInfo.postalCode}
                      onChange={handleBillingInfoChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={billingInfo.country}
                      onChange={handleBillingInfoChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={billingInfo.phone}
                      onChange={handleBillingInfoChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Payment Method</h2>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      id="credit_card"
                      name="paymentMethod"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={() => setPaymentMethod('credit_card')}
                      className="mr-2"
                    />
                    <label htmlFor="credit_card" className="flex items-center">
                      <span>Credit Card</span>
                      <div className="ml-2 flex space-x-1">
                        <svg className="h-6 w-8" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="48" height="48" rx="4" fill="#1A1F71"/>
                          <path d="M18.5 32H29.5V30H18.5V32Z" fill="white"/>
                          <path d="M19 21.8L22.5 26.2L26 21.8H19Z" fill="white"/>
                          <path d="M29.5 21.8L33 26.2L36.5 21.8H29.5Z" fill="white"/>
                          <path d="M11.5 21.8L15 26.2L18.5 21.8H11.5Z" fill="white"/>
                        </svg>
                        <svg className="h-6 w-8" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="48" height="48" rx="4" fill="#EB001B"/>
                          <circle cx="24" cy="24" r="12" fill="#F79E1B"/>
                        </svg>
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="bank_transfer"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="mr-2"
                    />
                    <label htmlFor="bank_transfer">Bank Transfer</label>
                  </div>
                </div>

                {paymentMethod === 'credit_card' && (
                  <div className="border p-4 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={cardInfo.cardNumber}
                          onChange={handleCardInfoChange}
                          placeholder="1234 5678 9012 3456"
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Name on Card *
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={cardInfo.cardName}
                          onChange={handleCardInfoChange}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={cardInfo.expiryDate}
                          onChange={handleCardInfoChange}
                          placeholder="MM/YY"
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          CVV *
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={cardInfo.cvv}
                          onChange={handleCardInfoChange}
                          placeholder="123"
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'bank_transfer' && (
                  <div className="border p-4 rounded">
                    <p className="text-gray-700 mb-4">Please enter your bank details for the transfer:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Bank Name *
                        </label>
                        <input
                          type="text"
                          name="bankName"
                          value={bankInfo.bankName}
                          onChange={handleBankInfoChange}
                          placeholder="Enter your bank name"
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Account Name *
                        </label>
                        <input
                          type="text"
                          name="accountName"
                          value={bankInfo.accountName}
                          onChange={handleBankInfoChange}
                          placeholder="Name on your bank account"
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Account Number *
                        </label>
                        <input
                          type="text"
                          name="accountNumber"
                          value={bankInfo.accountNumber}
                          onChange={handleBankInfoChange}
                          placeholder="Your account number"
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Routing Number *
                        </label>
                        <input
                          type="text"
                          name="routingNumber"
                          value={bankInfo.routingNumber}
                          onChange={handleBankInfoChange}
                          placeholder="Your bank routing number"
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Reference
                        </label>
                        <input
                          type="text"
                          name="reference"
                          value={bankInfo.reference}
                          onChange={handleBankInfoChange}
                          placeholder="Optional reference for the transfer"
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                      Note: Your booking will be confirmed once we receive your payment.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {paymentError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                <p>{paymentError}</p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="mr-2 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Back to Cart
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Complete Payment'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg p-4 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="max-h-80 overflow-y-auto mb-4">
              {cart.items.map((item) => (
                <div key={item._id} className="flex mb-4 pb-4 border-b">
                  <div className="w-16 h-16">
                    <img
                      src={item.tour.images[0]?.url || 'https://via.placeholder.com/150'}
                      alt={item.tour.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium text-gray-900">{item.tour.title}</h3>
                    <p className="text-gray-500 text-sm">
                      {new Date(item.startDate).toLocaleDateString()} • {item.travelers} {item.travelers === 1 ? 'traveler' : 'travelers'}
                    </p>
                    <p className="font-medium text-gray-900">
                      {formatPrice(item.price.amount * item.travelers, item.price.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
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

            {!cart.couponCode && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
                <p className="text-blue-800 font-medium mb-1">💡 Available Coupon Codes</p>
                <p className="text-blue-700 mb-1">Use <span className="font-medium">WELCOME10</span> for 10% off your first booking!</p>
                <p className="text-blue-600 text-xs">Apply coupon codes in your cart before checkout.</p>
              </div>
            )}

            <div className="text-sm text-gray-500">
              <p>By completing your purchase, you agree to our <a href="#" className="text-indigo-600 hover:text-indigo-800">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:text-indigo-800">Privacy Policy</a>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
