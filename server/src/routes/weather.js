import express from 'express';
import axios from 'axios';
import Tour from '../models/Tour.js';

const router = express.Router();

// OpenWeatherMap API key (in a real app, this would be in an environment variable)
const WEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';

// Get weather for a specific tour
router.get('/tour/:tourId', async (req, res) => {
  try {
    const { tourId } = req.params;

    // Find the tour
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Check if we already have recent weather data (less than 3 hours old)
    if (
      tour.weather &&
      tour.weather.lastUpdated &&
      new Date() - new Date(tour.weather.lastUpdated) < 3 * 60 * 60 * 1000
    ) {
      return res.json(tour.weather);
    }

    // Get coordinates from tour location
    const [longitude, latitude] = tour.location.coordinates;

    // Fetch weather data from OpenWeatherMap API
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`
    );

    // Extract relevant weather data
    const weatherData = {
      temperature: response.data.main.temp,
      condition: response.data.weather[0].main,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      lastUpdated: new Date()
    };

    // Update tour with weather data
    tour.weather = weatherData;
    await tour.save();

    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ message: 'Error fetching weather data', error: error.message });
  }
});

// Get weather forecast for a destination
router.get('/forecast/:destination', async (req, res) => {
  try {
    const { destination } = req.params;
    const { days = 5 } = req.query;

    // First, get coordinates for the destination using geocoding
    const geocodeResponse = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${destination}&limit=1&appid=${WEATHER_API_KEY}`
    );

    if (!geocodeResponse.data || geocodeResponse.data.length === 0) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    const { lat, lon } = geocodeResponse.data[0];

    // Fetch forecast data
    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=${days * 8}&appid=${WEATHER_API_KEY}`
    );

    // Process forecast data (one entry per day)
    const dailyForecasts = [];
    const forecastList = forecastResponse.data.list;

    // Group forecasts by day
    const forecastsByDay = {};
    forecastList.forEach(forecast => {
      const date = new Date(forecast.dt * 1000).toISOString().split('T')[0];
      if (!forecastsByDay[date]) {
        forecastsByDay[date] = [];
      }
      forecastsByDay[date].push(forecast);
    });

    // Get average for each day
    Object.keys(forecastsByDay).forEach(date => {
      const dayForecasts = forecastsByDay[date];
      const avgTemp = dayForecasts.reduce((sum, f) => sum + f.main.temp, 0) / dayForecasts.length;
      
      // Use the noon forecast for the day's weather condition
      const noonForecast = dayForecasts.find(f => {
        const hour = new Date(f.dt * 1000).getHours();
        return hour >= 11 && hour <= 13;
      }) || dayForecasts[0];

      dailyForecasts.push({
        date,
        temperature: Math.round(avgTemp * 10) / 10,
        condition: noonForecast.weather[0].main,
        description: noonForecast.weather[0].description,
        icon: noonForecast.weather[0].icon
      });
    });

    res.json({
      destination: geocodeResponse.data[0].name,
      country: geocodeResponse.data[0].country,
      forecast: dailyForecasts
    });
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    res.status(500).json({ message: 'Error fetching weather forecast', error: error.message });
  }
});

export default router;
