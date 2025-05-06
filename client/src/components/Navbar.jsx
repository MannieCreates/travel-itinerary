import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const { token, logout, user } = useAuth();
  const { getItemCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const { currency, supportedCurrencies, changeCurrency } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const userMenuRef = useRef(null);
  const currencyMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(event.target)) {
        setShowCurrencyMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
  };

  const handleCurrencyChange = (newCurrency) => {
    changeCurrency(newCurrency);
    setShowCurrencyMenu(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo Section */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.svg" alt="Travel Itinerary" className="h-8 w-auto" />
          <span className="text-2xl font-bold text-emerald-600">Travel Itinerary</span>
        </Link>

        {/* Main Navigation - Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors duration-200">
            Home
          </Link>
          <Link to="/search" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors duration-200">
            Tours
          </Link>
          <Link to="/blog" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors duration-200">
            Blog
          </Link>
          <Link to="/faq" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors duration-200">
            FAQ
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-4 pr-10 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* User Section - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Currency Selector */}
          <div className="relative" ref={currencyMenuRef}>
            <button
              onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-emerald-600"
            >
              {currency}
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showCurrencyMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  {supportedCurrencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => handleCurrencyChange(curr.code)}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        currency === curr.code ? 'bg-gray-100 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {curr.code} - {curr.name} ({curr.symbol})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {token ? (
            <>
              {/* Cart & Wishlist */}
              <div className="flex items-center space-x-3">
                <Link to="/wishlist" className="relative text-gray-700 hover:text-emerald-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {getWishlistCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {getWishlistCount()}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="relative text-gray-700 hover:text-emerald-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {getItemCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {getItemCount()}
                    </span>
                  )}
                </Link>
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-emerald-600"
                >
                  <span className="mr-1">{user?.username || 'Account'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/bookings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Your Bookings
                      </Link>
                      <Link
                        to="/reviews"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Your Reviews
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          className="block px-4 py-2 text-sm text-indigo-600 hover:bg-gray-50"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-colors duration-200"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          {token && (
            <div className="flex items-center mr-4 space-x-3">
              <Link to="/wishlist" className="relative text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {getWishlistCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {getWishlistCount()}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </Link>
            </div>
          )}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="w-6 h-6 relative">
              <span className={`absolute w-6 h-0.5 bg-gray-800 transform transition-all duration-200 ease-in-out ${isOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'}`}></span>
              <span className={`absolute w-6 h-0.5 bg-gray-800 transform transition-all duration-200 ease-in-out ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`absolute w-6 h-0.5 bg-gray-800 transform transition-all duration-200 ease-in-out ${isOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute w-full bg-white shadow-lg transition-all duration-200 ease-in-out z-40 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        <div className="px-4 py-3 space-y-2">
          <form onSubmit={handleSearch} className="mb-4">
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
          </form>

          <Link
            to="/"
            className="block px-4 py-2 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Home
          </Link>
          <Link
            to="/search"
            className="block px-4 py-2 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Tours
          </Link>
          <Link
            to="/blog"
            className="block px-4 py-2 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Blog
          </Link>
          <Link
            to="/faq"
            className="block px-4 py-2 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50"
          >
            FAQ
          </Link>

          {/* Currency Selector */}
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-gray-500 mb-1">Currency</p>
            <select
              value={currency}
              onChange={(e) => changeCurrency(e.target.value)}
              className="w-full p-2 border rounded text-sm"
            >
              {supportedCurrencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} - {curr.symbol}
                </option>
              ))}
            </select>
          </div>

          {token ? (
            <>
              <div className="border-t border-gray-200 my-2"></div>
              <Link
                to="/profile"
                className="block px-4 py-2 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Your Profile
              </Link>
              <Link
                to="/bookings"
                className="block px-4 py-2 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Your Bookings
              </Link>
              <Link
                to="/reviews"
                className="block px-4 py-2 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Your Reviews
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="block px-4 py-2 text-base font-medium text-indigo-600 rounded-lg hover:bg-gray-50"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <div className="border-t border-gray-200 my-2"></div>
              <Link
                to="/login"
                className="block px-4 py-2 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="block px-4 py-2 text-base font-medium text-emerald-600 rounded-lg hover:bg-gray-50"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;