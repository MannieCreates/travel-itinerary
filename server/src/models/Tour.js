import mongoose from 'mongoose';

const tourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in days
    required: true
  },
  price: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  startDates: [{
    date: Date,
    availableSeats: Number,
    totalSeats: Number
  }],
  category: {
    type: String,
    enum: ['Adventure', 'Cultural', 'Beach', 'Mountain', 'City', 'Wildlife'],
    required: true
  },
  inclusions: [{
    type: String
  }],
  itinerary: [{
    day: Number,
    title: String,
    description: String,
    activities: [String],
    accommodation: String,
    meals: [String]
  }],
  images: [{
    url: String,
    caption: String
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  weather: {
    temperature: Number,
    condition: String,
    description: String,
    icon: String,
    humidity: Number,
    windSpeed: Number,
    cloudCover: Number,
    precipitation: Number,
    lastUpdated: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

tourSchema.index({ location: '2dsphere' });
tourSchema.index({ destination: 'text', title: 'text', description: 'text' });

const Tour = mongoose.model('Tour', tourSchema);

export default Tour;