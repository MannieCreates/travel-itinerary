import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Tour from '../models/Tour.js';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import BlogPost from '../models/BlogPost.js';

const MONGODB_URI = 'mongodb+srv://root:root@cluster0.bgizyas.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Sample data
const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'password123'
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
        date: new Date('2024-07-01'),
        availableSeats: 15,
        totalSeats: 20
      },
      {
        date: new Date('2024-08-01'),
        availableSeats: 20,
        totalSeats: 20
      },
      {
        date: new Date('2024-09-15'),
        availableSeats: 18,
        totalSeats: 20
      },
      {
        date: new Date('2024-10-01'),
        availableSeats: 20,
        totalSeats: 20
      },
      {
        date: new Date('2024-11-01'),
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
        date: new Date('2024-06-15'),
        availableSeats: 10,
        totalSeats: 12
      },
      {
        date: new Date('2024-07-15'),
        availableSeats: 12,
        totalSeats: 12
      },
      {
        date: new Date('2024-08-15'),
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
        date: new Date('2024-05-15'),
        availableSeats: 18,
        totalSeats: 20
      },
      {
        date: new Date('2024-06-20'),
        availableSeats: 20,
        totalSeats: 20
      },
      {
        date: new Date('2024-09-10'),
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
        date: new Date('2024-07-10'),
        availableSeats: 12,
        totalSeats: 12
      },
      {
        date: new Date('2024-08-15'),
        availableSeats: 8,
        totalSeats: 12
      },
      {
        date: new Date('2024-09-20'),
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
        date: new Date('2024-06-01'),
        availableSeats: 16,
        totalSeats: 16
      },
      {
        date: new Date('2024-07-15'),
        availableSeats: 14,
        totalSeats: 16
      },
      {
        date: new Date('2024-08-30'),
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
        date: new Date('2024-05-01'),
        availableSeats: 14,
        totalSeats: 14
      },
      {
        date: new Date('2024-06-15'),
        availableSeats: 12,
        totalSeats: 14
      },
      {
        date: new Date('2024-10-01'),
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
      BlogPost.deleteMany({})
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
        ]
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
        ]
      },
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
        ]
      }
    ];
    await Review.create(reviews);
    console.log('Created reviews');

    // Create bookings
    const bookings = createdTours.map(tour => ({
      user: createdUsers[1]._id,
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
        transactionId: 'mock_transaction_' + Math.random().toString(36).substr(2, 9)
      }
    }));
    await Booking.create(bookings);
    console.log('Created bookings');

    // Create blog posts
    const blogPostsWithAuthor = blogPosts.map(post => ({
      ...post,
      author: createdUsers[0]._id // Admin user as author
    }));
    await BlogPost.create(blogPostsWithAuthor);
    console.log('Created blog posts');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 