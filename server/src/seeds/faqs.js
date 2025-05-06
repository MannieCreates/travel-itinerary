import mongoose from 'mongoose';
import FAQ from '../models/FAQ.js';

const MONGODB_URI = 'mongodb+srv://root:root@cluster0.bgizyas.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Sample FAQ data
const faqs = [
  {
    question: 'How do I book a tour?',
    answer: 'You can book a tour by browsing our available tours, selecting your preferred date, and following the checkout process. You\'ll need to create an account or log in to complete your booking.',
    category: 'booking',
    order: 1,
    isActive: true
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for tour bookings.',
    category: 'payment',
    order: 1,
    isActive: true
  },
  {
    question: 'Can I cancel my booking?',
    answer: 'Yes, you can cancel your booking through your account dashboard. Please note that our cancellation policy varies depending on how far in advance you cancel:\n\n- More than 30 days before departure: Full refund minus a 10% administrative fee\n- 15-30 days before departure: 70% refund\n- 7-14 days before departure: 50% refund\n- Less than 7 days before departure: No refund\n\nIn case of emergency situations, please contact our customer support team directly.',
    category: 'cancellation',
    order: 1,
    isActive: true
  },
  {
    question: 'How far in advance should I book my tour?',
    answer: 'We recommend booking at least 2-3 months in advance for popular destinations during peak season to ensure availability. For off-season travel or less popular destinations, booking 1 month ahead is usually sufficient.',
    category: 'booking',
    order: 2,
    isActive: true
  },
  {
    question: 'Are flights included in the tour price?',
    answer: 'No, our tour prices do not include international or domestic flights unless specifically stated in the tour description. We recommend arranging your flights after your tour booking is confirmed.',
    category: 'general',
    order: 1,
    isActive: true
  },
  {
    question: 'What should I pack for my trip?',
    answer: 'Packing requirements vary by destination and season. Once your booking is confirmed, you\'ll receive a detailed packing list specific to your tour. Generally, we recommend packing lightweight, comfortable clothing, appropriate footwear, personal medications, and travel adapters.',
    category: 'travel',
    order: 1,
    isActive: true
  },
  {
    question: 'Do I need travel insurance?',
    answer: 'Yes, comprehensive travel insurance is mandatory for all our tours. Your policy should cover medical expenses, emergency evacuation, trip cancellation, and lost luggage. We recommend purchasing insurance as soon as you book your tour.',
    category: 'travel',
    order: 2,
    isActive: true
  },
  {
    question: 'What is your COVID-19 policy?',
    answer: 'Our COVID-19 policies follow local regulations and international health guidelines. Currently, we require all travelers to comply with destination-specific entry requirements. We maintain enhanced sanitation protocols on all tours and may require proof of vaccination or negative tests depending on local regulations. For specific requirements related to your tour, please contact our customer service team.',
    category: 'covid',
    order: 1,
    isActive: true
  },
  {
    question: 'Are your tours suitable for children?',
    answer: 'Many of our tours are family-friendly, but suitability depends on the specific tour, activities involved, and the age of the children. Each tour description indicates whether it is suitable for families and any age restrictions. If you\'re unsure, please contact us before booking.',
    category: 'tours',
    order: 1,
    isActive: true
  },
  {
    question: 'What is the group size for your tours?',
    answer: 'Our standard tours typically have between 8-16 participants to ensure a personalized experience. Some specialized tours may have smaller or larger group sizes, which will be specified in the tour details.',
    category: 'tours',
    order: 2,
    isActive: true
  },
  {
    question: 'Do you offer private tours?',
    answer: 'Yes, most of our itineraries can be arranged as private tours for families or groups. Private tours offer more flexibility with dates and can be customized to your preferences. Contact us for a quote and availability.',
    category: 'tours',
    order: 3,
    isActive: true
  },
  {
    question: 'How do I get a refund if my tour is canceled?',
    answer: 'If we cancel a tour, you will be offered either a full refund or the option to transfer to another tour. Refunds are processed within 14 business days and returned to the original payment method.',
    category: 'payment',
    order: 2,
    isActive: true
  }
];

// Seeding function
async function seedFAQs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing FAQs
    await FAQ.deleteMany({});
    console.log('Cleared existing FAQs');

    // Create FAQs
    await FAQ.create(faqs);
    console.log('Created FAQs');

    console.log('FAQ database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding FAQ database:', error);
    process.exit(1);
  }
}

seedFAQs();
