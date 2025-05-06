import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Tour from '../models/Tour.js';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import BlogPost from '../models/BlogPost.js';
import FAQ from '../models/FAQ.js';
import Coupon from '../models/Coupon.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import Invoice from '../models/Invoice.js';

const MONGODB_URI = 'mongodb+srv://root:root@cluster0.bgizyas.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Function to generate future dates
const generateFutureDate = (monthsFromNow) => {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsFromNow);
  return date;
};

// Function to generate past dates
const generatePastDate = (monthsAgo) => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  return date;
};

// Sample data
const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    createdAt: generatePastDate(12) // 12 months ago
  },
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123',
    createdAt: generatePastDate(10) // 10 months ago
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'password123',
    createdAt: generatePastDate(9) // 9 months ago
  },
  {
    username: 'michael_brown',
    email: 'michael@example.com',
    password: 'password123',
    createdAt: generatePastDate(8) // 8 months ago
  },
  {
    username: 'sarah_wilson',
    email: 'sarah@example.com',
    password: 'password123',
    createdAt: generatePastDate(7) // 7 months ago
  },
  {
    username: 'david_johnson',
    email: 'david@example.com',
    password: 'password123',
    createdAt: generatePastDate(6) // 6 months ago
  },
  {
    username: 'emily_davis',
    email: 'emily@example.com',
    password: 'password123',
    createdAt: generatePastDate(5) // 5 months ago
  },
  {
    username: 'robert_miller',
    email: 'robert@example.com',
    password: 'password123',
    createdAt: generatePastDate(4) // 4 months ago
  },
  {
    username: 'jennifer_taylor',
    email: 'jennifer@example.com',
    password: 'password123',
    createdAt: generatePastDate(3) // 3 months ago
  },
  {
    username: 'william_anderson',
    email: 'william@example.com',
    password: 'password123',
    createdAt: generatePastDate(2) // 2 months ago
  },
  {
    username: 'olivia_thomas',
    email: 'olivia@example.com',
    password: 'password123',
    createdAt: generatePastDate(1) // 1 month ago
  },
  {
    username: 'james_jackson',
    email: 'james@example.com',
    password: 'password123',
    createdAt: new Date() // Today
  },
  {
    username: 'support_admin',
    email: 'support@example.com',
    password: 'admin123',
    role: 'admin',
    createdAt: generatePastDate(11) // 11 months ago
  }
];

const tours = [
  {
    title: 'Japanese Cultural Experience',
    description: 'Immerse yourself in Japanese culture with this comprehensive tour of Tokyo and Kyoto.',
    destination: 'Japan',
    duration: 10,
    price: {
      amount: 2500,
      currency: 'USD'
    },
    startDates: [
      {
        date: generateFutureDate(1), // 1 month from now
        availableSeats: 15,
        totalSeats: 20
      },
      {
        date: generateFutureDate(2), // 2 months from now
        availableSeats: 20,
        totalSeats: 20
      },
      {
        date: generateFutureDate(3), // 3 months from now
        availableSeats: 18,
        totalSeats: 20
      },
      {
        date: generateFutureDate(4), // 4 months from now
        availableSeats: 20,
        totalSeats: 20
      },
      {
        date: generateFutureDate(5), // 5 months from now
        availableSeats: 16,
        totalSeats: 20
      }
    ],
    category: 'Cultural',
    inclusions: [
      'Hotel accommodation',
      'Traditional tea ceremony',
      'Guided temple visits',
      'Bullet train passes',
      'Airport transfers'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Tokyo',
        description: 'Welcome to Japan! Transfer to your hotel and evening welcome dinner.',
        activities: ['Airport pickup', 'Hotel check-in', 'Welcome dinner'],
        accommodation: 'Tokyo Luxury Hotel',
        meals: ['Dinner']
      },
      {
        day: 2,
        title: 'Tokyo Exploration',
        description: 'Discover the contrast of old and new Tokyo through its most iconic sites.',
        activities: ['Senso-ji Temple visit', 'Nakamise Shopping Street', 'Shibuya Crossing experience', 'Tokyo Skytree observation'],
        accommodation: 'Tokyo Luxury Hotel',
        meals: ['Breakfast', 'Lunch']
      },
      {
        day: 3,
        title: 'Traditional Culture Day',
        description: 'Immerse yourself in Japanese traditional culture with hands-on experiences.',
        activities: ['Tea ceremony workshop', 'Kimono wearing session', 'Japanese calligraphy class', 'Traditional music performance'],
        accommodation: 'Tokyo Luxury Hotel',
        meals: ['Breakfast', 'Traditional Japanese lunch']
      },
      {
        day: 4,
        title: 'Mount Fuji and Hakone',
        description: 'Day trip to Mount Fuji and Hakone for natural beauty and relaxation.',
        activities: ['Mount Fuji 5th Station visit', 'Lake Ashi cruise', 'Hakone ropeway', 'Onsen experience'],
        accommodation: 'Hakone Ryokan',
        meals: ['Breakfast', 'Dinner']
      },
      {
        day: 5,
        title: 'Journey to Kyoto',
        description: 'Travel to Kyoto via bullet train and begin exploring the cultural capital.',
        activities: ['Bullet train journey', 'Kinkaku-ji (Golden Pavilion)', 'Nishiki Market tour'],
        accommodation: 'Kyoto Traditional Hotel',
        meals: ['Breakfast', 'Dinner']
      }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800',
        caption: 'Tokyo Skyline at Night'
      },
      {
        url: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800',
        caption: 'Traditional Japanese Temple'
      }
    ],
    location: {
      coordinates: [139.6917, 35.6895] // Tokyo coordinates
    }
  },
  {
    title: 'Bali Paradise Retreat',
    description: 'Experience the beauty and tranquility of Bali with this luxurious beach and cultural tour.',
    destination: 'Indonesia',
    duration: 7,
    price: {
      amount: 1800,
      currency: 'USD'
    },
    startDates: [
      {
        date: generateFutureDate(1), // 1 month from now
        availableSeats: 10,
        totalSeats: 12
      },
      {
        date: generateFutureDate(2), // 2 months from now
        availableSeats: 12,
        totalSeats: 12
      },
      {
        date: generateFutureDate(3), // 3 months from now
        availableSeats: 8,
        totalSeats: 12
      }
    ],
    category: 'Beach',
    inclusions: [
      'Luxury villa accommodation',
      'Daily spa treatments',
      'Cultural performances',
      'Private beach access',
      'Airport transfers',
      'Daily breakfast and select meals',
      'Yoga sessions',
      'Cooking class',
      'Temple ceremonies'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Welcome to Bali',
        description: 'Arrive in paradise! Transfer to your luxury villa and welcome ceremony.',
        activities: ['Airport pickup', 'Villa check-in', 'Welcome ceremony', 'Sunset cocktails'],
        accommodation: 'Luxury Beach Villa',
        meals: ['Welcome dinner']
      },
      {
        day: 2,
        title: 'Spiritual and Wellness Day',
        description: 'Begin your day with yoga and immerse yourself in Balinese spiritual practices.',
        activities: ['Morning yoga', 'Traditional blessing ceremony', 'Spa treatment', 'Meditation session'],
        accommodation: 'Luxury Beach Villa',
        meals: ['Breakfast', 'Healthy lunch', 'Dinner']
      },
      {
        day: 3,
        title: 'Cultural Heritage',
        description: 'Explore Bali\'s rich cultural heritage through temples and traditional villages.',
        activities: ['Tanah Lot Temple visit', 'Traditional village tour', 'Silver crafting workshop', 'Cultural dance performance'],
        accommodation: 'Luxury Beach Villa',
        meals: ['Breakfast', 'Lunch']
      },
      {
        day: 4,
        title: 'Nature and Adventure',
        description: 'Discover Bali\'s natural beauty through rice terraces and sacred forests.',
        activities: ['Tegalalang rice terrace walk', 'Sacred Monkey Forest', 'Coffee plantation visit', 'Sunset photography session'],
        accommodation: 'Luxury Beach Villa',
        meals: ['Breakfast', 'Picnic lunch']
      },
      {
        day: 5,
        title: 'Culinary Journey',
        description: 'Learn about Balinese cuisine and cooking techniques.',
        activities: ['Local market visit', 'Cooking class', 'Spice garden tour', 'Beach dinner'],
        accommodation: 'Luxury Beach Villa',
        meals: ['Breakfast', 'Lunch', 'Special dinner']
      }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
        caption: 'Bali Beach Sunset'
      },
      {
        url: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=800',
        caption: 'Luxury Villa in Bali'
      }
    ],
    location: {
      coordinates: [115.1889, -8.4095] // Bali coordinates
    }
  },
  {
    title: 'European Heritage Trail',
    description: 'Journey through the heart of Europe, exploring historic cities, magnificent castles, and rich cultural traditions.',
    destination: 'Europe',
    duration: 12,
    price: {
      amount: 3500,
      currency: 'USD'
    },
    startDates: [
      {
        date: generateFutureDate(2), // 2 months from now
        availableSeats: 18,
        totalSeats: 20
      },
      {
        date: generateFutureDate(3), // 3 months from now
        availableSeats: 20,
        totalSeats: 20
      },
      {
        date: generateFutureDate(6), // 6 months from now
        availableSeats: 15,
        totalSeats: 20
      }
    ],
    category: 'Cultural',
    inclusions: [
      '4-star hotel accommodations',
      'First-class train travel between cities',
      'Skip-the-line museum passes',
      'Local guide services',
      'Daily breakfast and select dinners',
      'Wine tasting sessions',
      'Cooking workshops',
      'Airport transfers'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Paris: City of Light',
        description: 'Begin your European journey in the romantic French capital.',
        activities: ['Eiffel Tower visit', 'Seine River cruise', 'Welcome dinner at Montmartre'],
        accommodation: 'Paris Boutique Hotel',
        meals: ['Welcome dinner']
      },
      {
        day: 2,
        title: 'Paris Arts & Culture',
        description: 'Immerse yourself in art and history.',
        activities: ['Louvre Museum tour', 'Notre-Dame Cathedral visit', 'French wine tasting'],
        accommodation: 'Paris Boutique Hotel',
        meals: ['Breakfast', 'Wine pairing dinner']
      },
      {
        day: 3,
        title: 'Journey to Amsterdam',
        description: 'Travel to the charming Dutch capital.',
        activities: ['First-class train journey', 'Canal tour', 'Van Gogh Museum visit'],
        accommodation: 'Amsterdam Canal Hotel',
        meals: ['Breakfast', 'Dinner']
      }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
        caption: 'Paris Eiffel Tower'
      },
      {
        url: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800',
        caption: 'Amsterdam Canals at Sunset'
      }
    ],
    location: {
      coordinates: [2.3522, 48.8566] // Paris coordinates
    }
  },
  {
    title: 'African Safari Adventure',
    description: 'Experience the majesty of African wildlife and landscapes in Tanzania and Kenya.',
    destination: 'Africa',
    duration: 8,
    price: {
      amount: 4200,
      currency: 'USD'
    },
    startDates: [
      {
        date: generateFutureDate(3), // 3 months from now
        availableSeats: 12,
        totalSeats: 12
      },
      {
        date: generateFutureDate(4), // 4 months from now
        availableSeats: 8,
        totalSeats: 12
      },
      {
        date: generateFutureDate(5), // 5 months from now
        availableSeats: 12,
        totalSeats: 12
      }
    ],
    category: 'Adventure',
    inclusions: [
      'Luxury lodge accommodations',
      'Safari game drives',
      'Professional wildlife guide',
      'All meals and drinks',
      'National park fees',
      'Small group guarantee (max 12)',
      'Photography workshop',
      'Cultural village visits'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Serengeti',
        description: 'Begin your African adventure in the legendary Serengeti.',
        activities: ['Airport welcome', 'Evening game drive', 'Sunset dinner in the bush'],
        accommodation: 'Luxury Safari Lodge',
        meals: ['Lunch', 'Dinner']
      },
      {
        day: 2,
        title: 'Big Five Safari',
        description: 'Full day searching for Africa\'s iconic wildlife.',
        activities: ['Morning game drive', 'Wildlife photography workshop', 'Evening game drive'],
        accommodation: 'Luxury Safari Lodge',
        meals: ['Breakfast', 'Lunch', 'Dinner']
      },
      {
        day: 3,
        title: 'Masai Culture',
        description: 'Experience traditional Masai life and continue wildlife viewing.',
        activities: ['Masai village visit', 'Cultural ceremony', 'Afternoon game drive'],
        accommodation: 'Luxury Safari Lodge',
        meals: ['Breakfast', 'Lunch', 'Dinner']
      }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=800',
        caption: 'Lions in Serengeti'
      },
      {
        url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
        caption: 'Luxury Safari Lodge'
      }
    ],
    location: {
      coordinates: [34.8888, -2.1540] // Serengeti coordinates
    }
  },
  {
    title: 'South American Explorer',
    description: 'Discover the wonders of Peru and Bolivia, from ancient ruins to natural marvels.',
    destination: 'South America',
    duration: 9,
    price: {
      amount: 2800,
      currency: 'USD'
    },
    startDates: [
      {
        date: generateFutureDate(2), // 2 months from now
        availableSeats: 16,
        totalSeats: 16
      },
      {
        date: generateFutureDate(4), // 4 months from now
        availableSeats: 14,
        totalSeats: 16
      },
      {
        date: generateFutureDate(6), // 6 months from now
        availableSeats: 16,
        totalSeats: 16
      }
    ],
    category: 'Adventure',
    inclusions: [
      'Hotel accommodations',
      'Internal flights',
      'Train to Machu Picchu',
      'Expert archaeology guide',
      'High-altitude preparation',
      'Traditional ceremonies',
      'Local community visits',
      'All entrance fees'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Cusco Introduction',
        description: 'Arrive in the ancient Incan capital and acclimatize to the altitude.',
        activities: ['Airport pickup', 'Coca tea welcome', 'Gentle city walking tour'],
        accommodation: 'Cusco Heritage Hotel',
        meals: ['Dinner']
      },
      {
        day: 2,
        title: 'Sacred Valley',
        description: 'Explore the Sacred Valley of the Incas.',
        activities: ['Pisac ruins', 'Local market visit', 'Traditional weaving demonstration'],
        accommodation: 'Sacred Valley Lodge',
        meals: ['Breakfast', 'Lunch']
      },
      {
        day: 3,
        title: 'Machu Picchu Discovery',
        description: 'Experience the wonder of Machu Picchu.',
        activities: ['Scenic train journey', 'Guided Machu Picchu tour', 'Sunset viewing'],
        accommodation: 'Aguas Calientes Hotel',
        meals: ['Breakfast', 'Lunch', 'Dinner']
      }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
        caption: 'Machu Picchu at Dawn'
      },
      {
        url: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800',
        caption: 'Sacred Valley Landscape'
      }
    ],
    location: {
      coordinates: [-72.5449, -13.1631] // Machu Picchu coordinates
    }
  },
  {
    title: 'Southeast Asian Culinary Journey',
    description: 'A food lover\'s adventure through Vietnam, Thailand, and Singapore.',
    destination: 'Southeast Asia',
    duration: 11,
    price: {
      amount: 2600,
      currency: 'USD'
    },
    startDates: [
      {
        date: generateFutureDate(1), // 1 month from now
        availableSeats: 14,
        totalSeats: 14
      },
      {
        date: generateFutureDate(3), // 3 months from now
        availableSeats: 12,
        totalSeats: 14
      },
      {
        date: generateFutureDate(7), // 7 months from now
        availableSeats: 14,
        totalSeats: 14
      }
    ],
    category: 'Cultural',
    inclusions: [
      'Boutique hotel stays',
      'Cooking classes',
      'Street food tours',
      'Market visits',
      'Internal flights',
      'Food photography session',
      'Restaurant reservations',
      'Local transport'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Hanoi Street Food Scene',
        description: 'Dive into Vietnam\'s vibrant street food culture.',
        activities: ['Old Quarter food walk', 'Coffee culture experience', 'Evening street food tour'],
        accommodation: 'Hanoi Boutique Hotel',
        meals: ['Dinner']
      },
      {
        day: 2,
        title: 'Cooking in Hanoi',
        description: 'Learn the secrets of Vietnamese cuisine.',
        activities: ['Market shopping', 'Cooking class', 'Herb garden visit'],
        accommodation: 'Hanoi Boutique Hotel',
        meals: ['Breakfast', 'Lunch']
      },
      {
        day: 3,
        title: 'Bangkok\'s Culinary Treasures',
        description: 'Experience the flavors of Thailand.',
        activities: ['Morning market tour', 'Temple visits', 'Thai cooking workshop'],
        accommodation: 'Bangkok River Hotel',
        meals: ['Breakfast', 'Lunch', 'Dinner']
      }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
        caption: 'Street Food Market in Bangkok'
      },
      {
        url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800',
        caption: 'Cooking Class in Vietnam'
      }
    ],
    location: {
      coordinates: [105.8342, 21.0285] // Hanoi coordinates
    }
  }
];

const blogPosts = [
  {
    title: '10 Must-Visit Places in Japan',
    slug: '10-must-visit-places-japan',
    content: `Japan is a country of contrasts, seamlessly blending ancient traditions with cutting-edge technology.
    From the neon-lit streets of Tokyo to the serene temples of Kyoto, every corner of Japan offers unique experiences.

    1. Tokyo Skytree
    Standing at 634 meters, the Tokyo Skytree offers breathtaking views of the metropolis. The observation decks provide
    360-degree views of the city, and on clear days, you can even spot Mount Fuji.

    2. Fushimi Inari Shrine, Kyoto
    Famous for its thousands of vermillion torii gates, this shrine dedicated to the rice god Inari is a photographer's
    paradise. The gates wind through a peaceful forest on Mount Inari.

    3. Mount Fuji
    Japan's iconic mountain is a UNESCO World Heritage site and a must-visit destination. Whether viewing it from afar
    or climbing to its summit, Mount Fuji is an unforgettable experience.

    4. Hiroshima Peace Memorial
    A sobering reminder of history, the Peace Memorial Park and Museum stand as symbols of peace and hope. The A-Bomb
    Dome is particularly moving.

    5. Nara Deer Park
    Home to over 1,200 wild deer considered sacred messengers of the gods. The park also houses the magnificent Todaiji
    Temple, the world's largest wooden building.

    Best Time to Visit:
    Spring (March to May) for cherry blossoms
    Fall (September to November) for autumn colors
    Winter (December to February) for snow and hot springs

    Travel Tips:
    - Get a Japan Rail Pass for cost-effective travel
    - Stay in a mix of hotels and traditional ryokans
    - Try local specialties in each region
    - Learn basic Japanese phrases
    - Carry cash as many places don't accept cards`,
    destination: 'Japan',
    categories: ['Travel Guide', 'Asia'],
    tags: ['Japan', 'Culture', 'Travel Tips'],
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
      caption: 'Mount Fuji at sunset'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800',
        caption: 'Ancient Temple in Kyoto'
      }
    ]
  },
  {
    title: 'Ultimate Bali Travel Guide',
    slug: 'ultimate-bali-travel-guide',
    content: `Bali, the Island of the Gods, offers something for everyone - from pristine beaches and lush jungles
    to spiritual temples and vibrant culture. This guide will help you plan the perfect Balinese getaway.

    Best Areas to Stay:

    1. Seminyak
    Known for luxury resorts, high-end dining, and sophisticated nightlife. The beach here is perfect for
    stunning sunsets and surfing.

    2. Ubud
    The cultural heart of Bali, surrounded by rice terraces and ancient temples. Perfect for those seeking
    spiritual experiences and artistic inspiration.

    3. Nusa Dua
    Family-friendly area with pristine beaches and calm waters. Home to many luxury resorts and perfect
    for water sports.

    Must-Do Experiences:

    1. Temple Hopping
    - Tanah Lot: Iconic sea temple perched on a rocky outcrop
    - Uluwatu Temple: Clifftop temple famous for its sunset Kecak fire dance
    - Besakih Temple: The largest and holiest Hindu temple in Bali

    2. Nature Adventures
    - Trek through the Tegalalang Rice Terraces
    - Visit the Sacred Monkey Forest
    - Climb Mount Batur for sunrise
    - Chase waterfalls in the jungle

    3. Wellness Activities
    - Traditional spa treatments
    - Yoga classes in Ubud
    - Meditation retreats
    - Healing ceremonies with local shamans

    Cultural Tips:
    - Dress modestly when visiting temples
    - Remove shoes before entering homes or temples
    - Use your right hand for eating and passing objects
    - Learn basic Indonesian phrases
    - Respect religious ceremonies and processions

    Food Guide:
    - Must-try dishes: Nasi Goreng, Mie Goreng, Satay Lilit
    - Best local warungs for authentic food
    - Top fine dining experiences
    - Traditional cooking classes

    Getting Around:
    - Rent a scooter for local travel
    - Hire a private driver for day trips
    - Use ride-hailing apps in urban areas
    - Book tours for remote locations

    Best Time to Visit:
    - Dry season: April to October
    - Peak season: July to August
    - Shoulder season: April to June and September
    - Avoid rainy season: November to March`,
    destination: 'Indonesia',
    categories: ['Travel Guide', 'Asia'],
    tags: ['Bali', 'Beach', 'Culture', 'Wellness'],
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      caption: 'Tegalalang Rice Terrace'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1583309217394-d358d0c11571?w=800',
        caption: 'Traditional Balinese Dance'
      }
    ]
  },
  {
    title: 'Exploring Europe\'s Cultural Capitals',
    slug: 'exploring-europe-cultural-capitals',
    content: `Europe's rich tapestry of history, art, and culture makes it a fascinating destination for travelers.
    From the romantic streets of Paris to the canal-lined cityscape of Amsterdam, each city tells its own unique story.

    Must-Visit Cities:

    1. Paris, France
    The City of Light never fails to enchant visitors with its blend of history, art, and gastronomy.
    - Visit the Louvre early to avoid crowds
    - Book Eiffel Tower tickets in advance
    - Explore charming neighborhoods like Marais and Montmartre
    - Experience world-class dining and café culture

    2. Amsterdam, Netherlands
    A city of picturesque canals, world-class museums, and rich history.
    - Take a canal cruise at sunset
    - Visit the Van Gogh Museum and Rijksmuseum
    - Explore by bicycle like a local
    - Experience the vibrant food scene

    3. Rome, Italy
    The Eternal City offers an unparalleled journey through history.
    - Book skip-the-line tickets for major attractions
    - Try authentic Roman cuisine in Trastevere
    - Visit the Vatican Museums early
    - Explore hidden piazzas and fountains

    Cultural Experiences:
    - Attend classical concerts in historic venues
    - Take cooking classes in each country
    - Visit local markets
    - Participate in seasonal festivals

    Travel Tips:
    - Get a Eurail Pass for train travel
    - Learn basic phrases in local languages
    - Book accommodations in central locations
    - Use local city passes for attractions
    - Carry both cash and cards`,
    destination: 'Europe',
    categories: ['Travel Guide', 'Culture'],
    tags: ['Europe', 'Culture', 'History', 'Art'],
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      caption: 'Paris Cityscape'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800',
        caption: 'Amsterdam Canals'
      }
    ]
  },
  {
    title: 'Safari Guide: Wildlife Adventures in East Africa',
    slug: 'safari-guide-east-africa',
    content: `Experience the magic of an African safari in Tanzania and Kenya, where nature's greatest spectacles
    unfold before your eyes. From the vast Serengeti plains to the majestic Masai Mara, this guide will help you
    plan your perfect safari adventure.

    Best Safari Destinations:

    1. Serengeti National Park
    Home to the Great Migration and abundant year-round wildlife.
    - Best time for wildebeest migration: June-July
    - Excellent big cat sightings
    - Hot air balloon safaris available
    - Luxury and tented camp options

    2. Ngorongoro Crater
    A UNESCO World Heritage site with incredible wildlife density.
    - All Big Five present
    - Unique crater ecosystem
    - Cultural visits to Masai villages
    - Spectacular photography opportunities

    3. Masai Mara
    Kenya's premier safari destination, especially during migration.
    - August-October for river crossings
    - Traditional Masai culture
    - Excellent bird watching
    - Intimate wildlife encounters

    Safari Tips:
    - Book with reputable operators
    - Pack appropriate clothing
    - Bring good camera equipment
    - Follow park guidelines
    - Respect wildlife and local cultures

    What to Pack:
    - Neutral-colored clothing
    - Sun protection
    - Binoculars
    - Camera with zoom lens
    - Insect repellent
    - First-aid supplies`,
    destination: 'Africa',
    categories: ['Travel Guide', 'Wildlife'],
    tags: ['Safari', 'Wildlife', 'Adventure', 'Nature'],
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=800',
      caption: 'Lions in Serengeti'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1509817988644-24a014b56d21?w=800',
        caption: 'Elephant Herd'
      }
    ]
  },
  {
    title: 'Ancient Wonders of Peru',
    slug: 'ancient-wonders-peru',
    content: `Discover the mystical world of the Incas and explore Peru's breathtaking archaeological sites.
    From the mighty Machu Picchu to the sacred Valley of the Incas, Peru offers an unforgettable journey through
    ancient history and stunning landscapes.

    Key Destinations:

    1. Machu Picchu
    The crown jewel of Incan civilization.
    - Book tickets well in advance
    - Consider hiking the Inca Trail
    - Visit early morning for best experience
    - Hire a knowledgeable guide

    2. Cusco
    The historic capital of the Inca Empire.
    - Acclimatize gradually
    - Explore San Blas neighborhood
    - Visit the San Pedro Market
    - Try local Andean cuisine

    3. Sacred Valley
    A living museum of Incan culture.
    - Visit Pisac ruins and market
    - Explore Ollantaytambo fortress
    - Experience traditional weaving
    - Try local chicha corn beer

    Practical Tips:
    - Altitude preparation is essential
    - Stay hydrated
    - Book train tickets early
    - Carry cash for local markets
    - Learn basic Spanish phrases

    Cultural Experiences:
    - Traditional ceremonies
    - Local cooking classes
    - Textile workshops
    - Music and dance shows`,
    destination: 'South America',
    categories: ['Travel Guide', 'History'],
    tags: ['Peru', 'Inca', 'Adventure', 'Culture'],
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
      caption: 'Machu Picchu Sunrise'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=800',
        caption: 'Cusco Plaza'
      }
    ]
  },
  {
    title: 'Street Food Paradise: Southeast Asian Flavors',
    slug: 'street-food-paradise-southeast-asia',
    content: `Embark on a culinary adventure through Southeast Asia, where street food reigns supreme and every
    meal is an exploration of flavors, textures, and aromas. From Vietnam's pho to Thailand's pad thai, discover
    the region's incredible food culture.

    Top Food Destinations:

    1. Hanoi, Vietnam
    The street food capital of Asia.
    - Must-try: Pho, Bun Cha, Banh Mi
    - Early morning food markets
    - Coffee culture
    - Food street etiquette

    2. Bangkok, Thailand
    A paradise for street food lovers.
    - Famous for: Pad Thai, Som Tam, Mango Sticky Rice
    - Chinatown food adventures
    - Night markets
    - Floating markets

    3. Singapore
    Where street food meets fine dining.
    - Hawker centers
    - Michelin-starred street food
    - Cultural food mix
    - Modern food scene

    Food Safety Tips:
    - Choose busy stalls
    - Watch for clean preparation
    - Drink bottled water
    - Be careful with ice
    - Know your spice tolerance

    Cultural Insights:
    - Local eating customs
    - Regional variations
    - Seasonal specialties
    - Food history

    Cooking Experiences:
    - Market tours
    - Cooking classes
    - Herb garden visits
    - Street food tours`,
    destination: 'Southeast Asia',
    categories: ['Food Guide', 'Culture'],
    tags: ['Food', 'Street Food', 'Cooking', 'Culture'],
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
      caption: 'Street Food Market'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800',
        caption: 'Cooking Class'
      }
    ]
  }
];

// Seeding function
async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Tour.deleteMany({}),
      Review.deleteMany({}),
      Booking.deleteMany({}),
      BlogPost.deleteMany({}),
      FAQ.deleteMany({}),
      Coupon.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create users
    const createdUsers = await Promise.all(
      users.map(async user => {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        return User.create({
          ...user,
          password: hashedPassword
        });
      })
    );
    console.log('Created users');

    // Create tours
    const createdTours = await Tour.create(tours);
    console.log('Created tours');

    // Create reviews
    const reviews = [
      // Reviews for Japanese Cultural Experience
      {
        user: createdUsers[1]._id,
        tour: createdTours[0]._id,
        rating: 5,
        title: 'Amazing experience!',
        comment: 'This was one of the best tours I have ever been on. The guides were knowledgeable and friendly, and the itinerary was perfectly balanced. The traditional experiences were authentic and the accommodations were excellent. Highly recommended!',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
            caption: 'Trip Highlight - Temple Visit'
          }
        ],
        createdAt: generatePastDate(2)
      },
      {
        user: createdUsers[2]._id,
        tour: createdTours[0]._id,
        rating: 4,
        title: 'Great tour with minor hiccups',
        comment: 'Overall a fantastic experience. The cultural activities were outstanding and the guides were excellent. Lost one star due to a scheduling issue with one of the temple visits, but the company handled it professionally.',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800',
            caption: 'Temple Visit in Bali'
          }
        ],
        createdAt: generatePastDate(3)
      },
      {
        user: createdUsers[3]._id,
        tour: createdTours[0]._id,
        rating: 5,
        title: 'Unforgettable Japan adventure',
        comment: 'The Japanese Cultural Experience tour was absolutely incredible. From the moment we arrived in Tokyo, everything was perfectly organized. The tea ceremony was a highlight, and the accommodations were top-notch. I would definitely book with this company again!',
        createdAt: generatePastDate(1)
      },

      // Reviews for Bali Paradise Retreat
      {
        user: createdUsers[1]._id,
        tour: createdTours[1]._id,
        rating: 5,
        title: 'Paradise Found in Bali',
        comment: 'The Bali retreat exceeded all expectations. The villa was stunning, the spa treatments were heavenly, and the cultural experiences were authentic and meaningful. The staff went above and beyond to make our stay special.',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
            caption: 'Villa View in Bali'
          }
        ],
        createdAt: generatePastDate(4)
      },
      {
        user: createdUsers[4]._id,
        tour: createdTours[1]._id,
        rating: 4,
        title: 'Relaxing and rejuvenating',
        comment: 'The Bali Paradise Retreat was exactly what I needed. The yoga sessions were excellent, and the spa treatments were divine. The only reason I am not giving 5 stars is because the weather was not great, but that is obviously not the tour company fault!',
        createdAt: generatePastDate(2)
      },
      {
        user: createdUsers[5]._id,
        tour: createdTours[1]._id,
        rating: 3,
        title: 'Beautiful but overpriced',
        comment: 'While the retreat was beautiful and the staff were friendly, I felt that it was overpriced for what was included. Some of the activities felt rushed, and the villa, while nice, was not as luxurious as advertised.',
        createdAt: generatePastDate(1)
      },

      // Reviews for European Heritage Trail
      {
        user: createdUsers[6]._id,
        tour: createdTours[2]._id,
        rating: 5,
        title: 'Europe at its finest',
        comment: 'The European Heritage Trail was a dream come true. The skip-the-line museum passes saved us so much time, and the local guides were incredibly knowledgeable. The accommodations were charming and perfectly located. Highly recommend!',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
            caption: 'Paris View'
          }
        ],
        createdAt: generatePastDate(3)
      },
      {
        user: createdUsers[7]._id,
        tour: createdTours[2]._id,
        rating: 4,
        title: 'Wonderful cultural immersion',
        comment: 'This tour offered a perfect balance of guided activities and free time to explore. The wine tasting in Paris was a highlight, and the train journeys between cities were comfortable and scenic. Would recommend to culture enthusiasts.',
        createdAt: generatePastDate(2)
      },

      // Reviews for African Safari Adventure
      {
        user: createdUsers[8]._id,
        tour: createdTours[3]._id,
        rating: 5,
        title: 'Wildlife experience of a lifetime',
        comment: 'The African Safari Adventure exceeded all expectations. We saw all of the Big Five within the first two days! The safari guides were incredibly knowledgeable, and the luxury lodge was the perfect place to relax after exciting game drives.',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=800',
            caption: 'Lion Sighting'
          }
        ],
        createdAt: generatePastDate(5)
      },
      {
        user: createdUsers[9]._id,
        tour: createdTours[3]._id,
        rating: 5,
        title: 'Magical safari experience',
        comment: 'From the moment we arrived, this safari adventure was magical. The accommodations were luxurious, the food was excellent, and the wildlife sightings were incredible. The Masai village visit was a cultural highlight that added depth to the experience.',
        createdAt: generatePastDate(1)
      },

      // Reviews for South American Explorer
      {
        user: createdUsers[10]._id,
        tour: createdTours[4]._id,
        rating: 4,
        title: 'Machu Picchu was breathtaking',
        comment: 'The South American Explorer tour was well-organized and educational. Machu Picchu was even more impressive in person than in photos. The altitude preparation was helpful, though I still felt the effects. The archaeological guide was extremely knowledgeable.',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
            caption: 'Machu Picchu View'
          }
        ],
        createdAt: generatePastDate(3)
      },
      {
        user: createdUsers[11]._id,
        tour: createdTours[4]._id,
        rating: 3,
        title: 'Good tour but exhausting',
        comment: 'While the destinations were amazing, particularly Machu Picchu, the pace of the tour was very demanding. There was little time to rest between activities, and the high altitude made it challenging. The guide was excellent, but the schedule needs improvement.',
        createdAt: generatePastDate(2)
      },

      // Reviews for Southeast Asian Culinary Journey
      {
        user: createdUsers[2]._id,
        tour: createdTours[5]._id,
        rating: 5,
        title: 'A feast for the senses',
        comment: 'This culinary journey through Southeast Asia was incredible! The street food tours were a highlight, and the cooking classes taught us skills we will use forever. The accommodations were charming, and the small group size made for a personalized experience.',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
            caption: 'Street Food Market'
          }
        ],
        createdAt: generatePastDate(4)
      },
      {
        user: createdUsers[3]._id,
        tour: createdTours[5]._id,
        rating: 4,
        title: 'Delicious adventure',
        comment: 'The food experiences on this tour were outstanding. From street food to high-end restaurants, we tried it all. The market tours were fascinating, and the cooking classes were well-structured. My only suggestion would be to include more vegetarian options.',
        createdAt: generatePastDate(1)
      }
    ];
    await Review.create(reviews);
    console.log('Created reviews');

    // Create bookings with various statuses and dates
    const bookingStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    const paymentMethods = ['credit_card', 'bank_transfer', 'wallet'];

    // Create a variety of bookings for different users and tours
    const bookings = [];

    // Add confirmed bookings for each tour
    createdTours.forEach((tour, index) => {
      // Add a confirmed booking for each tour
      bookings.push({
        user: createdUsers[index % (createdUsers.length - 1) + 1]._id, // Skip admin user
        tour: tour._id,
        startDate: tour.startDates[0].date,
        status: 'confirmed',
        participants: {
          adults: 2,
          children: 1
        },
        totalPrice: {
          amount: tour.price.amount * 2.5, // 2 adults + 1 child at half price
          currency: tour.price.currency
        },
        paymentInfo: {
          method: 'credit_card',
          status: 'completed',
          transactionId: 'mock_transaction_' + Math.random().toString(36).substring(2, 11)
        },
        createdAt: generatePastDate(1) // Created 1 month ago
      });

      // Add a completed booking for each tour
      bookings.push({
        user: createdUsers[(index + 1) % (createdUsers.length - 1) + 1]._id,
        tour: tour._id,
        startDate: generatePastDate(2), // Past date
        status: 'completed',
        participants: {
          adults: 1,
          children: 0
        },
        totalPrice: {
          amount: tour.price.amount,
          currency: tour.price.currency
        },
        paymentInfo: {
          method: paymentMethods[index % paymentMethods.length],
          status: 'completed',
          transactionId: 'mock_transaction_' + Math.random().toString(36).substring(2, 11)
        },
        createdAt: generatePastDate(3) // Created 3 months ago
      });

      // Add a pending booking for each tour
      bookings.push({
        user: createdUsers[(index + 2) % (createdUsers.length - 1) + 1]._id,
        tour: tour._id,
        startDate: tour.startDates[1].date,
        status: 'pending',
        participants: {
          adults: 2,
          children: 2
        },
        totalPrice: {
          amount: tour.price.amount * 3, // 2 adults + 2 children at half price
          currency: tour.price.currency
        },
        paymentInfo: {
          method: paymentMethods[(index + 1) % paymentMethods.length],
          status: 'pending',
          transactionId: null
        },
        createdAt: new Date() // Created today
      });

      // Add a cancelled booking for each tour
      if (index % 2 === 0) { // Only for some tours
        bookings.push({
          user: createdUsers[(index + 3) % (createdUsers.length - 1) + 1]._id,
          tour: tour._id,
          startDate: generateFutureDate(1),
          status: 'cancelled',
          participants: {
            adults: 3,
            children: 0
          },
          totalPrice: {
            amount: tour.price.amount * 3,
            currency: tour.price.currency
          },
          paymentInfo: {
            method: paymentMethods[(index + 2) % paymentMethods.length],
            status: 'refunded',
            transactionId: 'mock_transaction_' + Math.random().toString(36).substring(2, 11)
          },
          createdAt: generatePastDate(1) // Created 1 month ago
        });
      }
    });

    await Booking.create(bookings);
    console.log('Created bookings');

    // Create blog posts with different authors and statuses
    const blogPostsWithAuthor = [];

    // Published posts by admin
    blogPosts.forEach((post, index) => {
      blogPostsWithAuthor.push({
        ...post,
        author: createdUsers[0]._id, // Admin user as author
        createdAt: generatePastDate(index + 1)
      });
    });

    // Add draft posts
    blogPostsWithAuthor.push({
      title: 'Hidden Gems of Southeast Asia',
      slug: 'hidden-gems-southeast-asia',
      content: `This draft post will explore lesser-known destinations across Southeast Asia that offer authentic experiences away from the tourist crowds.

      Preliminary outline:
      1. Introduction to off-the-beaten-path travel in Southeast Asia
      2. Hidden beaches in Thailand
      3. Mountain villages in Vietnam
      4. Undiscovered temples in Cambodia
      5. Island escapes in the Philippines
      6. Practical tips for exploring remote areas
      7. Responsible tourism considerations

      Need to add more research on local transportation options and accommodation recommendations.`,
      destination: 'Southeast Asia',
      categories: ['Travel Guide', 'Off the Beaten Path'],
      tags: ['Hidden Gems', 'Authentic Travel', 'Southeast Asia'],
      status: 'draft',
      author: createdUsers[0]._id,
      createdAt: new Date()
    });

    blogPostsWithAuthor.push({
      title: 'Sustainable Travel: Reducing Your Carbon Footprint',
      slug: 'sustainable-travel-carbon-footprint',
      content: `Draft post on sustainable travel practices.

      Key points to cover:
      - Carbon offsetting for flights
      - Choosing eco-friendly accommodations
      - Sustainable transportation options
      - Supporting local communities
      - Reducing plastic waste while traveling
      - Responsible wildlife tourism

      Need to add statistics on tourism's environmental impact and more specific recommendations for different types of destinations.`,
      destination: 'Global',
      categories: ['Sustainable Travel', 'Travel Tips'],
      tags: ['Eco-friendly', 'Responsible Tourism', 'Green Travel'],
      status: 'draft',
      author: createdUsers[0]._id,
      createdAt: generatePastDate(0.5)
    });

    // Add archived post
    blogPostsWithAuthor.push({
      title: 'Travel Trends for 2022',
      slug: 'travel-trends-2022',
      content: `This post explored the top travel trends for 2022, including:

      1. Workations and digital nomad lifestyles
      2. Regenerative travel experiences
      3. Private and exclusive accommodations
      4. Outdoor and nature-focused getaways
      5. Contactless technology in tourism
      6. Domestic tourism boom
      7. Luxury travel resurgence

      While these trends were relevant in 2022, we've archived this post as we now have updated information for the current year.`,
      destination: 'Global',
      categories: ['Travel Trends', 'Industry Insights'],
      tags: ['2022', 'Travel Industry', 'Trends'],
      status: 'archived',
      author: createdUsers[0]._id,
      createdAt: generatePastDate(18),
      updatedAt: generatePastDate(6)
    });

    // Add posts by other authors (support admin)
    blogPostsWithAuthor.push({
      title: 'Top 5 Adventure Activities in New Zealand',
      slug: 'top-adventure-activities-new-zealand',
      content: `New Zealand is known as the adventure capital of the world, and for good reason. The country offers an incredible array of adrenaline-pumping activities set against some of the most spectacular scenery on Earth.

      Here are the top 5 adventure activities you shouldn't miss:

      1. Bungee Jumping in Queenstown
      The commercial bungee jump was pioneered in New Zealand by AJ Hackett, and Queenstown offers several iconic jumping spots. The Kawarau Bridge jump (43 meters) is the original, while the Nevis Bungy (134 meters) provides a more extreme experience with 8.5 seconds of free fall.

      2. Skydiving over Lake Wanaka
      Experience the ultimate adrenaline rush with a tandem skydive over the stunning Lake Wanaka region. With jump heights ranging from 9,000 to 15,000 feet, you'll enjoy breathtaking views of mountains, lakes, and the Southern Alps before an exhilarating free fall at 200 km/h.

      3. White Water Rafting on the Kaituna River
      Navigate the Kaituna River near Rotorua, which features the highest commercially rafted waterfall in the world at 7 meters. With grade 5 rapids and drops, this adventure offers the perfect combination of excitement and stunning rainforest scenery.

      4. Heli-Hiking on Franz Josef Glacier
      Combine a scenic helicopter flight with an ice-hiking adventure on the ancient Franz Josef Glacier. Equipped with crampons and led by expert guides, you'll explore ice caves, crevasses, and seracs in this unique frozen landscape that few get to experience up close.

      5. Canyoning in Abel Tasman National Park
      Descend through sculpted canyons, jump into crystal-clear pools, abseil down waterfalls, and slide down natural water chutes. Abel Tasman offers canyoning experiences for various skill levels, all set within the pristine environment of New Zealand's smallest national park.

      Safety Tips:
      - Always book with reputable operators with strong safety records
      - Listen carefully to all safety briefings
      - Be honest about your fitness level and any medical conditions
      - Check that your travel insurance covers adventure activities
      - Follow guide instructions at all times

      Best Time for Adventure Activities:
      The summer months (December to February) offer the best weather conditions for most outdoor adventures, but many activities operate year-round with seasonal variations in experience and pricing.`,
      destination: 'New Zealand',
      categories: ['Adventure Travel', 'Oceania'],
      tags: ['New Zealand', 'Adventure', 'Adrenaline', 'Outdoor Activities'],
      status: 'published',
      featuredImage: {
        url: 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=800',
        caption: 'Bungee Jumping in New Zealand'
      },
      author: createdUsers[12]._id, // Support admin
      createdAt: generatePastDate(3),
      publishedAt: generatePastDate(2.5)
    });
    await BlogPost.create(blogPostsWithAuthor);
    console.log('Created blog posts');

    // Create FAQs
    const faqs = [
      // Booking FAQs
      {
        question: 'How do I book a tour?',
        answer: 'You can book a tour by browsing our available tours, selecting your preferred date, and following the checkout process. You\'ll need to create an account or log in to complete your booking.',
        category: 'booking',
        order: 1,
        isActive: true
      },
      {
        question: 'Can I book a tour for someone else?',
        answer: 'Yes, you can book a tour for friends or family members. During the booking process, you\'ll have the option to enter the traveler details for each participant. Just make sure to provide accurate information for all travelers.',
        category: 'booking',
        order: 2,
        isActive: true
      },
      {
        question: 'How far in advance should I book my tour?',
        answer: 'We recommend booking at least 3-6 months in advance for popular destinations, especially during peak season. This ensures you get your preferred dates and accommodations. Last-minute bookings are possible but subject to availability.',
        category: 'booking',
        order: 3,
        isActive: true
      },
      {
        question: 'Is there a minimum number of participants required for a tour to proceed?',
        answer: 'Most of our group tours require a minimum of 4-6 participants to operate. If the minimum is not met, we will offer you alternative dates, a different tour, or a full refund. Private tours do not have minimum participant requirements.',
        category: 'booking',
        order: 4,
        isActive: true
      },

      // Payment FAQs
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for tour bookings.',
        category: 'payment',
        order: 1,
        isActive: true
      },
      {
        question: 'Do I need to pay the full amount when booking?',
        answer: 'For bookings made more than 60 days before departure, a 25% deposit is required to secure your reservation, with the remaining balance due 60 days before the tour starts. For bookings made within 60 days of departure, full payment is required at the time of booking.',
        category: 'payment',
        order: 2,
        isActive: true
      },
      {
        question: 'Are there any hidden fees or additional costs?',
        answer: 'No, we are transparent about our pricing. The tour price includes all accommodations, activities, and meals as specified in the itinerary. Additional costs may include optional activities, personal expenses, and gratuities. International airfare is not included unless specifically stated.',
        category: 'payment',
        order: 3,
        isActive: true
      },
      {
        question: 'Do you offer any discounts?',
        answer: 'Yes, we offer various discounts including early bird specials (10% off when booking 6+ months in advance), group discounts (5% off for groups of 6 or more), and loyalty discounts for returning customers. We also run seasonal promotions throughout the year.',
        category: 'payment',
        order: 4,
        isActive: true
      },

      // Cancellation FAQs
      {
        question: 'Can I cancel my booking?',
        answer: 'Yes, you can cancel your booking through your account dashboard. Please note that our cancellation policy varies depending on how far in advance you cancel:\n\n- More than 30 days before departure: Full refund minus a 10% administrative fee\n- 15-30 days before departure: 70% refund\n- 7-14 days before departure: 50% refund\n- Less than 7 days before departure: No refund\n\nIn case of emergency situations, please contact our customer support team directly.',
        category: 'cancellation',
        order: 1,
        isActive: true
      },
      {
        question: 'What happens if the tour is cancelled by the company?',
        answer: 'If we need to cancel a tour due to unforeseen circumstances (natural disasters, political instability, etc.), you will be offered a full refund or the option to transfer your booking to another tour. We will also assist with any reasonable related expenses incurred due to the cancellation.',
        category: 'cancellation',
        order: 2,
        isActive: true
      },
      {
        question: 'Do you offer travel insurance?',
        answer: 'We strongly recommend purchasing comprehensive travel insurance that covers trip cancellation, medical emergencies, and baggage loss. While we don\'t sell insurance directly, we can recommend reputable providers. Proof of travel insurance is required for certain adventure tours.',
        category: 'cancellation',
        order: 3,
        isActive: true
      },

      // General FAQs
      {
        question: 'Are flights included in the tour price?',
        answer: 'No, our tour prices do not include international or domestic flights unless specifically stated in the tour description. We recommend arranging your flights after your tour booking is confirmed.',
        category: 'general',
        order: 1,
        isActive: true
      },
      {
        question: 'What is the average group size for your tours?',
        answer: 'Our group tours typically have 8-16 participants, ensuring a personalized experience while still providing the social benefits of group travel. Some specialty tours may have smaller or larger group sizes as specified in the tour details.',
        category: 'general',
        order: 2,
        isActive: true
      },
      {
        question: 'Are your tours suitable for solo travelers?',
        answer: 'Absolutely! Many of our clients are solo travelers. Our group tours are a great way to meet like-minded people. We offer single room options for those who prefer privacy, or we can match you with a roommate of the same gender to avoid the single supplement fee.',
        category: 'general',
        order: 3,
        isActive: true
      },
      {
        question: 'Are your tours accessible for people with disabilities?',
        answer: 'We strive to make our tours accessible to all travelers. Some tours are more suitable for those with mobility issues than others. Please contact us to discuss your specific needs, and we\'ll work to accommodate you or recommend the most appropriate tours.',
        category: 'general',
        order: 4,
        isActive: true
      },
      {
        question: 'What should I pack for my tour?',
        answer: 'A detailed packing list will be provided in your pre-departure information. Generally, we recommend packing light, bringing layers for variable weather, comfortable walking shoes, and any necessary medications. Specific requirements vary by destination and season.',
        category: 'general',
        order: 5,
        isActive: true
      },

      // Travel FAQs
      {
        question: 'Do I need a visa for my destination?',
        answer: 'Visa requirements depend on your nationality and the countries you\'ll be visiting. We provide general visa information in our tour details, but it is ultimately your responsibility to ensure you have the correct visas. We recommend checking with the relevant embassies or consulates well in advance of your trip.',
        category: 'travel',
        order: 1,
        isActive: true
      },
      {
        question: 'Are transfers included from the airport?',
        answer: 'Airport transfers are included on the first and last day of the tour as specified in the itinerary. If you arrive earlier or depart later, we can arrange additional transfers for an extra fee. Details about meeting points and transfer arrangements will be provided in your pre-departure information.',
        category: 'travel',
        order: 2,
        isActive: true
      },
      {
        question: 'What type of accommodations can I expect?',
        answer: 'Accommodations vary by tour category. Our standard tours feature comfortable 3-4 star hotels, while luxury tours include 4-5 star hotels and unique properties. Adventure tours might include a mix of hotels, lodges, and camping. All accommodations are carefully selected for cleanliness, location, and character.',
        category: 'travel',
        order: 3,
        isActive: true
      },

      // COVID FAQs
      {
        question: 'What is your COVID-19 policy?',
        answer: 'Our COVID-19 policies follow local regulations and international health guidelines. Currently, we require all travelers to comply with destination-specific entry requirements. We maintain enhanced sanitation protocols on all tours and may require proof of vaccination or negative tests depending on local regulations.',
        category: 'covid',
        order: 1,
        isActive: true
      },
      {
        question: 'What happens if I test positive for COVID-19 before or during my tour?',
        answer: 'If you test positive before your tour, you can reschedule for a later date or receive a credit voucher valid for 24 months. If you test positive during the tour, we will assist with quarantine arrangements and medical support. We strongly recommend travel insurance that covers COVID-related disruptions.',
        category: 'covid',
        order: 2,
        isActive: true
      },
      {
        question: 'What health and safety measures are in place on your tours?',
        answer: 'We follow enhanced health protocols including regular sanitization of vehicles and high-touch surfaces, provision of hand sanitizer, health screening of staff, and working with accommodations and restaurants that maintain high hygiene standards. Our guides are trained in health and safety procedures.',
        category: 'covid',
        order: 3,
        isActive: true
      }
    ];

    await FAQ.create(faqs);
    console.log('Created FAQs');

    // Create coupons
    const coupons = [
      // General coupons
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
        applicableTours: [], // Empty array means applicable to all tours
        createdAt: generatePastDate(6)
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
        applicableTours: [createdTours[0]._id], // First tour
        createdAt: generatePastDate(2)
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
        applicableTours: [createdTours[1]._id, createdTours[2]._id], // Second and third tours
        createdAt: generatePastDate(3)
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
        applicableTours: [], // All tours
        createdAt: generatePastDate(1)
      },

      // Seasonal coupons
      {
        code: 'SPRING2023',
        type: 'percentage',
        value: 12,
        minPurchase: 800,
        maxDiscount: 300,
        validFrom: generatePastDate(3),
        validUntil: generatePastDate(1),
        usageLimit: 75,
        isActive: false, // Expired
        applicableTours: [],
        createdAt: generatePastDate(4)
      },
      {
        code: 'WINTER2023',
        type: 'percentage',
        value: 20,
        minPurchase: 1500,
        maxDiscount: 600,
        validFrom: generatePastDate(1),
        validUntil: generateFutureDate(2),
        usageLimit: 50,
        isActive: true,
        applicableTours: [createdTours[3]._id, createdTours[4]._id], // Fourth and fifth tours
        createdAt: generatePastDate(1)
      },

      // Special event coupons
      {
        code: 'ANNIVERSARY5',
        type: 'percentage',
        value: 30,
        minPurchase: 0,
        maxDiscount: 1000,
        validFrom: generateFutureDate(1),
        validUntil: generateFutureDate(1.5), // Valid for 2 weeks
        usageLimit: 100,
        isActive: true,
        applicableTours: [],
        createdAt: new Date()
      },
      {
        code: 'FLASH24HR',
        type: 'percentage',
        value: 25,
        minPurchase: 0,
        maxDiscount: 750,
        validFrom: generateFutureDate(0.1), // Starts in a few days
        validUntil: generateFutureDate(0.13), // Valid for 24 hours only
        usageLimit: 50,
        isActive: true,
        applicableTours: [],
        createdAt: new Date()
      },

      // Destination-specific coupons
      {
        code: 'JAPAN2023',
        type: 'percentage',
        value: 15,
        minPurchase: 2000,
        maxDiscount: 600,
        validFrom: new Date(),
        validUntil: generateFutureDate(4),
        usageLimit: 40,
        isActive: true,
        applicableTours: [createdTours[0]._id], // Japanese tour
        createdAt: generatePastDate(0.5)
      },
      {
        code: 'BALI2023',
        type: 'fixed',
        value: 200,
        minPurchase: 1500,
        maxDiscount: null,
        validFrom: new Date(),
        validUntil: generateFutureDate(3),
        usageLimit: 30,
        isActive: true,
        applicableTours: [createdTours[1]._id], // Bali tour
        createdAt: generatePastDate(0.5)
      },

      // Customer segment coupons
      {
        code: 'LOYALTY200',
        type: 'fixed',
        value: 200,
        minPurchase: 1000,
        maxDiscount: null,
        validFrom: new Date(),
        validUntil: generateFutureDate(12),
        usageLimit: 1, // One-time use per customer
        isActive: true,
        applicableTours: [],
        createdAt: generatePastDate(1)
      },
      {
        code: 'FIRSTTIME15',
        type: 'percentage',
        value: 15,
        minPurchase: 0,
        maxDiscount: 300,
        validFrom: new Date(),
        validUntil: generateFutureDate(12),
        usageLimit: 1, // One-time use for new customers
        isActive: true,
        applicableTours: [],
        createdAt: generatePastDate(5)
      }
    ];

    await Coupon.create(coupons);
    console.log('Created coupons');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();