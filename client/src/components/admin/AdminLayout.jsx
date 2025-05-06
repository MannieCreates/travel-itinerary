import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { token, user } = useAuth();
  const location = useLocation();

  // Check if user is authenticated and is an admin
  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  // For a college project, we'll use a simple role check
  // In a real application, you would verify this on the server
  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin/dashboard"
                className={`block p-2 rounded ${
                  location.pathname === '/admin/dashboard'
                    ? 'bg-indigo-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/admin/tours"
                className={`block p-2 rounded ${
                  location.pathname === '/admin/tours'
                    ? 'bg-indigo-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Tours
              </Link>
            </li>
            <li>
              <Link
                to="/admin/bookings"
                className={`block p-2 rounded ${
                  location.pathname === '/admin/bookings'
                    ? 'bg-indigo-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Bookings
              </Link>
            </li>
            <li>
              <Link
                to="/admin/users"
                className={`block p-2 rounded ${
                  location.pathname === '/admin/users'
                    ? 'bg-indigo-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Users
              </Link>
            </li>
            <li>
              <Link
                to="/admin/coupons"
                className={`block p-2 rounded ${
                  location.pathname === '/admin/coupons'
                    ? 'bg-indigo-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Coupons
              </Link>
            </li>
            <li>
              <Link
                to="/admin/faqs"
                className={`block p-2 rounded ${
                  location.pathname === '/admin/faqs'
                    ? 'bg-indigo-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                FAQs
              </Link>
            </li>
            <li>
              <Link
                to="/admin/blog"
                className={`block p-2 rounded ${
                  location.pathname === '/admin/blog'
                    ? 'bg-indigo-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Blog Posts
              </Link>
            </li>
            <li className="mt-6">
              <Link
                to="/"
                className="flex items-center p-2 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Site
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              {location.pathname === '/admin/dashboard' && 'Dashboard'}
              {location.pathname === '/admin/tours' && 'Tours Management'}
              {location.pathname === '/admin/bookings' && 'Bookings Management'}
              {location.pathname === '/admin/users' && 'Users Management'}
              {location.pathname === '/admin/coupons' && 'Coupons Management'}
              {location.pathname === '/admin/faqs' && 'FAQs Management'}
              {location.pathname === '/admin/blog' && 'Blog Posts Management'}
            </h1>
            <div className="text-sm text-gray-600">
              Logged in as: <span className="font-medium">{user?.username || 'Admin'}</span>
            </div>
          </div>
        </header>
        <main className="p-6 overflow-auto flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
