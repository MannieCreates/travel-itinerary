import React, { useState } from 'react';

export const ImageGallery = ({ images = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-200 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
        <img 
          src={images[activeIndex]?.url || 'https://via.placeholder.com/1200x600?text=No+Image'} 
          alt={images[activeIndex]?.caption || 'Tour image'} 
          className="w-full h-full object-cover"
        />
        {images[activeIndex]?.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3">
            {images[activeIndex].caption}
          </div>
        )}
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <div 
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`
                cursor-pointer rounded-lg overflow-hidden flex-shrink-0 w-24 h-16 
                ${activeIndex === index ? 'ring-2 ring-emerald-500' : ''}
              `}
            >
              <img 
                src={image.url} 
                alt={image.caption || `Tour image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
