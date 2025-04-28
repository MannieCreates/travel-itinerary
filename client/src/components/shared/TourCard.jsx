import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';
import { categories } from './CategorySelector';

export const TourCard = ({
  tour,
  variant = 'horizontal', // 'horizontal' or 'vertical'
}) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  if (variant === 'vertical') {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition duration-300 hover:shadow-xl h-full flex flex-col">
        <div className="relative w-full aspect-[3/2] flex-shrink-0">
          <img
            src={tour.images[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image'}
            alt={tour.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent p-4 flex flex-col justify-end">
            <h3 className="text-2xl font-bold text-white">{tour.title}</h3>
            <p className="text-white/90">{tour.destination}</p>
          </div>
        </div>
        <div className="p-4 flex-grow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 font-medium">{tour.rating.toFixed(1)}</span>
              <span className="ml-2 text-gray-600">
                ({tour.totalReviews.toLocaleString()} reviews)
              </span>
            </div>
            <div className="text-emerald-600 font-bold">
              {formatPrice(tour.price.amount, tour.price.currency)}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">
              ⏱ {tour.duration} days
            </span>
            <Link
              to={`/tours/${tour._id}`}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Explore →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300 h-full">
      <div className="flex flex-col md:flex-row h-full">
        <div className="w-full md:w-[300px] h-[220px] md:h-auto relative flex-shrink-0">
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src={tour.images[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image'}
            alt={tour.title}
          />
        </div>
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex-1">
            <div className="flex flex-col h-full">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                {tour.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {tour.description}
              </p>
              <div className="flex flex-wrap gap-2 text-sm mt-auto">
                <span className="bg-gray-100 px-2 py-1 rounded">
                  ⏱ {tour.duration} days
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded">
                  ⭐ {tour.rating.toFixed(1)} ({tour.totalReviews} reviews)
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded">
                  🏷 {categories.find(cat => cat.id === tour.category)?.name || tour.category}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-emerald-600 font-bold">
              {formatPrice(tour.price.amount, tour.price.currency)}
              <span className="text-gray-500 text-sm font-normal">
                /person
              </span>
            </div>
            <Link
              to={`/tours/${tour._id}`}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition duration-300"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};