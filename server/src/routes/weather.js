import express from 'express';
import axios from 'axios';
import Tour from '../models/Tour.js';

const router = express.Router();

// OpenWeatherMap API key (in a real app, this would be in an environment variable)
// For development, we'll use a mock API key and return mock data
const WEATHER_API_KEY = 'mock_api_key_for_development';

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

    // For development, we'll use mock data instead of making a real API call
    // In a production app, you would use the actual OpenWeatherMap API

    // Generate a realistic temperature based on the tour's location
    // This is just a simple algorithm to create somewhat realistic temperatures
    // based on latitude (colder near poles, warmer near equator)
    const baseTemp = 25; // Base temperature in Celsius
    const latitudeEffect = Math.abs(latitude) / 90 * 30; // Max 30 degrees effect
    const randomVariation = Math.random() * 8 - 4; // Random variation of +/- 4 degrees

    // Calculate temperature (warmer near equator, colder near poles)
    const calculatedTemp = Math.round((baseTemp - latitudeEffect + randomVariation) * 10) / 10;

    // Weather conditions based on temperature ranges
    let condition, description, icon;
    if (calculatedTemp > 30) {
      condition = 'Hot';
      description = 'Hot and sunny';
      icon = '01d'; // Clear sky day
    } else if (calculatedTemp > 20) {
      condition = 'Sunny';
      description = 'Clear sky';
      icon = '01d'; // Clear sky day
    } else if (calculatedTemp > 10) {
      condition = 'Mild';
      description = 'Partly cloudy';
      icon = '02d'; // Few clouds day
    } else if (calculatedTemp > 0) {
      condition = 'Cool';
      description = 'Cloudy';
      icon = '03d'; // Scattered clouds day
    } else {
      condition = 'Cold';
      description = 'Cold and cloudy';
      icon = '13d'; // Snow day
    }

    // Create mock weather data
    const weatherData = {
      temperature: calculatedTemp,
      condition: condition,
      description: description,
      icon: icon,
      humidity: Math.floor(Math.random() * 30) + 50, // Random humidity between 50-80%
      windSpeed: Math.floor(Math.random() * 20) + 5, // Random wind speed between 5-25 km/h
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

    // For development, we'll use mock data instead of making real API calls

    // Generate mock coordinates based on destination name
    // This is just a simple hash function to generate consistent coordinates for the same destination
    const generateCoordinates = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }

      // Generate latitude between -60 and 60 (most populated areas)
      const lat = ((hash % 120) - 60) + (Math.random() * 2 - 1);
      // Generate longitude between -180 and 180
      const lon = ((hash * 31 % 360) - 180) + (Math.random() * 2 - 1);

      return { lat: parseFloat(lat.toFixed(4)), lon: parseFloat(lon.toFixed(4)) };
    };

    const { lat, lon } = generateCoordinates(destination);

    // Generate mock forecast data for the requested number of days
    const dailyForecasts = [];
    const today = new Date();

    // Base temperature for the location (based on latitude)
    const baseTemp = 25 - (Math.abs(lat) / 90 * 30);

    // Generate forecast for each day
    for (let i = 0; i < days; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      const dateString = forecastDate.toISOString().split('T')[0];

      // Add some random variation to temperature for each day
      const dailyVariation = Math.random() * 10 - 5; // +/- 5 degrees
      const temperature = Math.round((baseTemp + dailyVariation) * 10) / 10;

      // Determine weather condition based on temperature
      let condition, description, icon;
      if (temperature > 30) {
        condition = 'Hot';
        description = 'Hot and sunny';
        icon = '01d'; // Clear sky day
      } else if (temperature > 20) {
        condition = 'Clear';
        description = 'Clear sky';
        icon = '01d'; // Clear sky day
      } else if (temperature > 10) {
        condition = 'Clouds';
        description = 'Partly cloudy';
        icon = '02d'; // Few clouds day
      } else if (temperature > 0) {
        condition = 'Clouds';
        description = 'Cloudy';
        icon = '03d'; // Scattered clouds day
      } else {
        condition = 'Snow';
        description = 'Light snow';
        icon = '13d'; // Snow day
      }

      dailyForecasts.push({
        date: dateString,
        temperature,
        condition,
        description,
        icon
      });
    }

    // Create a response with the mock data
    res.json({
      destination: destination,
      country: destination.includes(',') ? destination.split(',')[1].trim() : 'Unknown',
      forecast: dailyForecasts
    });
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    res.status(500).json({ message: 'Error fetching weather forecast', error: error.message });
  }
});

export default router;
