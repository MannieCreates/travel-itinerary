import axios from 'axios';

// In production, use relative URL; in development, use full URL with port
const isProduction = import.meta.env.PROD;
const API_BASE_URL = isProduction ? '/api' : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if not already there
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export const searchTours = async (params) => {
  try {
    const response = await api.get('/tours/search', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error searching tours' };
  }
};

export const getTourById = async (id) => {
  try {
    const response = await api.get(`/tours/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching tour details' };
  }
};

export const getTourAvailability = async (tourId) => {
  try {
    const response = await api.get(`/tours/${tourId}/availability`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching tour availability' };
  }
};

export const getTourWeather = async (tourId) => {
  try {
    const response = await api.get(`/weather/tour/${tourId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching weather data' };
  }
};

export const getDestinationForecast = async (destination, days = 5) => {
  try {
    const response = await api.get(`/weather/forecast/${destination}`, {
      params: { days }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching weather forecast' };
  }
};

export const getTourReviews = async (tourId, page = 1, limit = 5) => {
  try {
    const response = await api.get(`/reviews/tour/${tourId}`, {
      params: { page, limit, sort: '-createdAt' }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching tour reviews' };
  }
};

export const submitReview = async (reviewData) => {
  try {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error submitting review' };
  }
};

export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating review' };
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error deleting review' };
  }
};

export const getUserCompletedBookings = async () => {
  try {
    const response = await api.get('/bookings/completed');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching completed bookings' };
  }
};

export default api;