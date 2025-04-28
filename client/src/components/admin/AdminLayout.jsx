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
                to="/"
                className="block p-2 rounded text-gray-700 hover:bg-gray-100"
              >
                Back to Site
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              {location.pathname === '/admin/dashboard' && 'Dashboard'}
              {location.pathname === '/admin/tours' && 'Tours Management'}
              {location.pathname === '/admin/bookings' && 'Bookings Management'}
              {location.pathname === '/admin/users' && 'Users Management'}
            </h1>
            <div className="text-sm text-gray-600">
              Logged in as: <span className="font-medium">{user?.username || 'Admin'}</span>
            </div>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
