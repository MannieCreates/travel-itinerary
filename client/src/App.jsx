import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import NotFound from './components/NotFound';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CurrencyProvider } from './context/CurrencyContext';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <div className="App flex flex-col min-h-screen">
                <Navbar />
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
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;