import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import SearchResults from './components/SearchResults';
import TourDetails from './components/TourDetails';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Wishlist from './components/Wishlist';
import UserProfile from './components/UserProfile';
import UserBookings from './components/UserBookings';
import UserReviews from './components/UserReviews';
import BlogList from './components/BlogList';
import BlogPost from './components/BlogPost';
import FAQ from './components/FAQ';
import NotFound from './components/NotFound';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import ToursPage from './pages/admin/ToursPage';
import BookingsPage from './pages/admin/BookingsPage';
import UsersPage from './pages/admin/UsersPage';
import CouponsPage from './pages/admin/CouponsPage';
import FAQsPage from './pages/admin/FAQsPage';
import BlogPostsPage from './pages/admin/BlogPostsPage';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CurrencyProvider } from './context/CurrencyContext';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { token, user } = useAuth();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <div className="App flex flex-col min-h-screen">
                <NavbarWithConditionalRendering />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/tours/:id" element={<TourDetails />} />
                    <Route path="/cart" element={
                      <PrivateRoute>
                        <Cart />
                      </PrivateRoute>
                    } />
                    <Route path="/checkout" element={
                      <PrivateRoute>
                        <Checkout />
                      </PrivateRoute>
                    } />
                    <Route path="/wishlist" element={
                      <PrivateRoute>
                        <Wishlist />
                      </PrivateRoute>
                    } />
                    <Route path="/profile" element={
                      <PrivateRoute>
                        <UserProfile />
                      </PrivateRoute>
                    } />
                    <Route path="/bookings" element={
                      <PrivateRoute>
                        <UserBookings />
                      </PrivateRoute>
                    } />
                    <Route path="/reviews" element={
                      <PrivateRoute>
                        <UserReviews />
                      </PrivateRoute>
                    } />
                    <Route path="/blog" element={<BlogList />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/faq" element={<FAQ />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
                    <Route path="/admin/dashboard" element={
                      <AdminRoute>
                        <DashboardPage />
                      </AdminRoute>
                    } />
                    <Route path="/admin/tours" element={
                      <AdminRoute>
                        <ToursPage />
                      </AdminRoute>
                    } />
                    <Route path="/admin/bookings" element={
                      <AdminRoute>
                        <BookingsPage />
                      </AdminRoute>
                    } />
                    <Route path="/admin/users" element={
                      <AdminRoute>
                        <UsersPage />
                      </AdminRoute>
                    } />
                    <Route path="/admin/coupons" element={
                      <AdminRoute>
                        <CouponsPage />
                      </AdminRoute>
                    } />
                    <Route path="/admin/faqs" element={
                      <AdminRoute>
                        <FAQsPage />
                      </AdminRoute>
                    } />
                    <Route path="/admin/blog" element={
                      <AdminRoute>
                        <BlogPostsPage />
                      </AdminRoute>
                    } />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                {/* Conditionally render Footer only for non-admin routes */}
                <FooterWithConditionalRendering />
              </div>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

// Component to conditionally render Navbar
function NavbarWithConditionalRendering() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Don't render Navbar on admin routes
  if (isAdminRoute) {
    return null;
  }

  return <Navbar />;
}

// Component to conditionally render Footer
function FooterWithConditionalRendering() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Don't render Footer on admin routes
  if (isAdminRoute) {
    return null;
  }

  return <Footer />;
}

export default App;