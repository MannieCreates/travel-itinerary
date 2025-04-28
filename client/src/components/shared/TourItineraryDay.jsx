import React from 'react';

export const TourItineraryDay = ({ 
  dayNumber, 
  title, 
  description, 
  activities, 
  meals, 
  accommodation 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="bg-emerald-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4">
            {dayNumber}
          </div>
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        
        {description && (
          <p className="text-gray-700 mb-4">{description}</p>
        )}
        
        {activities && activities.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Activities:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {activities.map((activity, index) => (
                <li key={index} className="text-gray-700">{activity}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          {accommodation && (
            <div className="bg-blue-50 px-3 py-2 rounded-lg">
              <span className="font-medium">Accommodation:</span> {accommodation}
            </div>
          )}
          
          {meals && meals.length > 0 && (
            <div className="bg-amber-50 px-3 py-2 rounded-lg">
              <span className="font-medium">Meals:</span> {meals.join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourItineraryDay;
