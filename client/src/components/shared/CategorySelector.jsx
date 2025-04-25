import React from 'react';

export const categories = [
  { id: 'all', name: 'All', icon: '🌎' },
  { id: 'Beach', name: 'Beaches', icon: '🏖' },
  { id: 'Mountain', name: 'Mountains', icon: '⛰' },
  { id: 'City', name: 'Cities', icon: '🌆' },
  { id: 'Cultural', name: 'Cultural', icon: '🏛' },
  { id: 'Adventure', name: 'Adventure', icon: '🏃' },
  { id: 'Wildlife', name: 'Wildlife', icon: '🦁' },
];

export const CategorySelector = ({
  selectedCategory,
  onCategorySelect,
  displayType = 'buttons', // 'buttons' or 'grid'
}) => {
  if (displayType === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`p-6 rounded-lg text-center transition duration-300 ${
              selectedCategory === category.id
                ? 'bg-emerald-100 border-2 border-emerald-500'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <span className="text-4xl mb-2 block">{category.icon}</span>
            <span className="font-medium">{category.name}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onCategorySelect(category.id)}
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm transition duration-300 ${
            selectedCategory === category.id
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-500'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="mr-1">{category.icon}</span>
          {category.name}
        </button>
      ))}
    </div>
  );
}; 