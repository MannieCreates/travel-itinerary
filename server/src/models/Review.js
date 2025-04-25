import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  comment: {
    type: String,
    required: true
  },
  images: [{
    url: String,
    caption: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one review per user per tour
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

// Update tour rating when review is added/modified
reviewSchema.post('save', async function() {
  const Tour = mongoose.model('Tour');
  const reviews = await this.constructor.find({ tour: this.tour });
  
  const avgRating = reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;
  
  await Tour.findByIdAndUpdate(this.tour, {
    rating: Math.round(avgRating * 10) / 10,
    totalReviews: reviews.length
  });
});

const Review = mongoose.model('Review', reviewSchema);

export default Review; 