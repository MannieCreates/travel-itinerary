import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export default api; 