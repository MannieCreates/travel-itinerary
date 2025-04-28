import React from 'react';

const WeatherDisplay = ({ weather, className = '' }) => {
  if (!weather) {
    return null;
  }

  // Get weather icon URL from OpenWeatherMap
  const getWeatherIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-bold text-gray-800 mb-4">Weather at Destination</h3>
      <div className="flex items-center">
        {weather.icon && (
          <div className="mr-4">
            <img 
              src={getWeatherIconUrl(weather.icon)} 
              alt={weather.condition} 
              className="w-16 h-16"
            />
          </div>
        )}
        <div className="mr-4">
          <span className="text-4xl font-bold">{Math.round(weather.temperature)}°C</span>
        </div>
        <div>
          <div className="font-medium">{weather.condition}</div>
          <div className="text-sm text-gray-600">{weather.description}</div>
          {weather.humidity && (
            <div className="text-sm text-gray-500">
              Humidity: {weather.humidity}%
            </div>
          )}
          {weather.windSpeed && (
            <div className="text-sm text-gray-500">
              Wind: {weather.windSpeed} km/h
            </div>
          )}
        </div>
      </div>
      {weather.lastUpdated && (
        <div className="mt-4 text-xs text-gray-500">
          Last updated: {new Date(weather.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default WeatherDisplay;
