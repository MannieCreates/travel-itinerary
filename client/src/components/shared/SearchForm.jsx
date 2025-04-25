import React from 'react';
import { CategorySelector } from './CategorySelector';

export const SearchForm = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onSubmit,
  className = '',
  showSearchButton = true,
}) => {
  // Get today's date in YYYY-MM-DD format for min date attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={onSubmit} className={`bg-white rounded-lg shadow-xl p-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Destination Input */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Destination
          </label>
          <input
            type="text"
            placeholder="Where to?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Check In
          </label>
          <input
            type="date"
            value={startDate}
            min={today}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (endDate && e.target.value > endDate) {
                setEndDate(e.target.value);
              }
            }}
            className="w-full px-4 py-2 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Check Out
          </label>
          <input
            type="date"
            value={endDate}
            min={startDate || today}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Search Button */}
        {showSearchButton && (
          <div className="col-span-1 md:col-span-2 lg:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition duration-300 h-[42px]"
            >
              Search Tours
            </button>
          </div>
        )}
      </div>

      {/* Category Selection */}
      <div className="mt-4">
        <CategorySelector
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      </div>
    </form>
  );
}; 