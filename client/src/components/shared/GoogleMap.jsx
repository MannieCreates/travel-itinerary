import React from 'react';

const GoogleMap = ({ location, destination, height = '300px' }) => {
  // Default coordinates if location is not provided
  const defaultCoordinates = [0, 0];

  // Extract coordinates from location or use defaults
  const coordinates = location?.coordinates || defaultCoordinates;
  const [longitude, latitude] = coordinates;

  // Create Google Maps URL with coordinates
  // Note: In a production app, you would store the API key in environment variables
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyAcfDn2C_B7NAWUO72s3hyYKjD-d9HI3z8
    &q=${encodeURIComponent(destination)}
    &center=${latitude},${longitude}
    &zoom=10`;

  return (
    <div className="w-full overflow-hidden rounded-lg" style={{ height }}>
      <iframe
        title={`Map of ${destination}`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        src={mapUrl}
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default GoogleMap;
