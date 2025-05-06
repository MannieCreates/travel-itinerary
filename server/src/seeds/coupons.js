import mongoose from 'mongoose';
import Coupon from '../models/Coupon.js';

const MONGODB_URI = 'mongodb+srv://root:root@cluster0.bgizyas.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Function to generate future dates
const generateFutureDate = (monthsFromNow) => {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsFromNow);
  return date;
};

// Sample coupon data
const coupons = [
  {
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minPurchase: 0,
    maxDiscount: null,
    validFrom: new Date(),
    validUntil: generateFutureDate(12), // Valid for 1 year
    usageLimit: null,
    isActive: true,
    applicableTours: [] // Empty array means applicable to all tours
  },
  {
    code: 'SUMMER2023',
    type: 'percentage',
    value: 15,
    minPurchase: 1000,
    maxDiscount: 500,
    validFrom: new Date(),
    validUntil: generateFutureDate(3), // Valid for 3 months
    usageLimit: 100,
    isActive: true,
    applicableTours: [] // Will be populated in the seeding function
  },
  {
    code: 'FIXED50',
    type: 'fixed',
    value: 50,
    minPurchase: 500,
    maxDiscount: null,
    validFrom: new Date(),
    validUntil: generateFutureDate(6), // Valid for 6 months
    usageLimit: 50,
    isActive: true,
    applicableTours: [] // Will be populated in the seeding function
  },
  {
    code: 'FAMILY25',
    type: 'percentage',
    value: 25,
    minPurchase: 2000,
    maxDiscount: 1000,
    validFrom: new Date(),
    validUntil: generateFutureDate(6), // Valid for 6 months
    usageLimit: 30,
    isActive: true,
    applicableTours: [] // Will be populated in the seeding function
  }
];

// Seeding function
async function seedCoupons() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing coupons
    await Coupon.deleteMany({});
    console.log('Cleared existing coupons');

    // Get tour IDs to associate with some coupons
    const tours = await mongoose.model('Tour').find().select('_id');
    
    if (tours.length > 0) {
      // Assign specific tours to some coupons
      coupons[1].applicableTours = [tours[0]._id]; // SUMMER2023 applies to first tour
      
      if (tours.length >= 3) {
        coupons[2].applicableTours = [tours[1]._id, tours[2]._id]; // FIXED50 applies to second and third tours
      }
    }

    // Create coupons
    await Coupon.create(coupons);
    console.log('Created coupons');

    console.log('Coupon database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding coupon database:', error);
    process.exit(1);
  }
}

// Run the seeding function if this file is executed directly
if (require.main === module) {
  seedCoupons();
}

export { seedCoupons };
