import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [loading, setLoading] = useState(false);

  // Fetch user data when token is available but user data isn't
  useEffect(() => {
    const fetchUserData = async () => {
      if (token && !user) {
        try {
          setLoading(true);
          const response = await api.get('/users/me');
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Error fetching user data:', error);
          // If we can't fetch user data, token might be invalid
          if (error.response?.status === 401) {
            logout();
          }
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [token]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      const { token, userId } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      setToken(token);
      setUserId(userId);

      // Fetch user data
      const userResponse = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userResponse.data);
      localStorage.setItem('user', JSON.stringify(userResponse.data));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', {
        username,
        email,
        password
      });
      const { token, userId } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      setToken(token);
      setUserId(userId);

      // Fetch user data
      const userResponse = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userResponse.data);
      localStorage.setItem('user', JSON.stringify(userResponse.data));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    setToken(null);
    setUserId(null);
    setUser(null);
  };

  const updateUserData = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{
      token,
      userId,
      user,
      loading,
      login,
      register,
      logout,
      updateUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};