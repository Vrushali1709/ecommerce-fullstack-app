export type Review = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
};

export type Product = {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  discountPercent?: number;
  priceValue: number;
  category: string;
  rating: number;
  reviewCount?: number;
  description: string;
  image: string;
  images: string[];
  highlights?: string[];
  specs?: Record<string, string>;
  reviews?: Review[];
};

export const products: Product[] = [
  {
    id: '1',
    name: 'Classic Chronograph Watch',
    price: '₹2,499',
    originalPrice: '₹4,999',
    discountPercent: 50,
    priceValue: 2499,
    category: 'Watches',
    rating: 4.8,
    reviewCount: 142,
    description:
      'A timeless classic chronograph watch engineered with sapphire crystal glass, Japanese quartz movement, and premium stainless steel finish. Perfect for formal, business, and everyday luxury.',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000',
    ],
    highlights: [
      'Japanese Quartz Chronograph Movement',
      'Water Resistant up to 50 Meters (5 ATM)',
      'Scratch-resistant Sapphire Glass Dial',
      'Interchangeable Genuine Leather Strap',
    ],
    specs: {
      Brand: 'Aethel Luxury',
      DialDiameter: '42 mm',
      StrapMaterial: 'Genuine Leather',
      WaterResistance: '50m',
      Warranty: '2 Years Manufacturer Warranty',
    },
    reviews: [
      {
        id: 'r1',
        userName: 'Aarav Patel',
        rating: 5,
        comment: 'Outstanding quality and weight. Looks even better in real life than pictures!',
        date: '24 Sep 2026',
      },
      {
        id: 'r2',
        userName: 'Priya Sharma',
        rating: 4.5,
        comment: 'Gifted this to my husband and he absolutely loves the finish.',
        date: '18 Sep 2026',
      },
    ],
  },

  {
    id: '2',
    name: 'Minimalist Leather Tote Bag',
    price: '₹3,999',
    originalPrice: '₹6,499',
    discountPercent: 38,
    priceValue: 3999,
    category: 'Bags',
    rating: 4.7,
    reviewCount: 98,
    description:
      'Handcrafted full-grain leather tote designed with spacious interior compartments, padded 15-inch laptop sleeve, and sleek magnetic brass closures.',
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1000',
    ],
    highlights: [
      '100% Genuine Full-Grain Calfskin Leather',
      'Fits up to 15.6-inch MacBook / Laptops',
      'Water-repellent interior lining with organizers',
      'Reinforced shoulder straps for comfortable carry',
    ],
    specs: {
      Brand: 'Nordic Craft',
      Dimensions: '38 x 30 x 14 cm',
      Compartments: '4 Pockets + Laptop Sleeve',
      Closure: 'YKK Premium Metal Zippers',
      Warranty: '1 Year Warranty',
    },
    reviews: [
      {
        id: 'r3',
        userName: 'Neha Mehta',
        rating: 5,
        comment: 'Spacious and elegant. Carries my laptop and daily essentials effortlessly.',
        date: '15 Sep 2026',
      },
    ],
  },

  {
    id: '3',
    name: 'Pro Ultralight Running Shoes',
    price: '₹4,499',
    originalPrice: '₹7,999',
    discountPercent: 44,
    priceValue: 4499,
    category: 'Shoes',
    rating: 4.9,
    reviewCount: 215,
    description:
      'Engineered for maximum energy return and breathability. Features responsive foam cushioning, breathable knit upper, and anti-slip rubber traction.',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1000',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1000',
    ],
    highlights: [
      'Responsive ReactFoam Sole Cushioning',
      'Seamless Breathable FlyKnit Upper Mesh',
      'High-durability Carbon Rubber Outsole',
      'Ultralightweight build (only 210g)',
    ],
    specs: {
      Brand: 'AeroStride',
      Weight: '210g (Size 9)',
      SoleMaterial: 'High-Grip Carbon Rubber',
      Terrain: 'Road, Gym & Track',
      Warranty: '6 Months Replacement Guarantee',
    },
    reviews: [
      {
        id: 'r4',
        userName: 'Rohan Joshi',
        rating: 5,
        comment: 'Feels like walking on clouds! Best shoes for running and workouts.',
        date: '22 Sep 2026',
      },
    ],
  },

  {
    id: '4',
    name: 'Wireless ANC Headphones',
    price: '₹2,999',
    originalPrice: '₹5,999',
    discountPercent: 50,
    priceValue: 2999,
    category: 'Electronics',
    rating: 4.8,
    reviewCount: 180,
    description:
      'Immerse yourself in studio-grade audio with hybrid Active Noise Cancellation, 40-hour battery life, and ultra-soft memory foam earcups.',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1000',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1000',
    ],
    highlights: [
      'Hybrid Active Noise Cancellation (-35dB)',
      'Up to 40 Hours Playtime on Single Charge',
      'Fast Type-C Charging (10 mins = 4 hours)',
      'Dual Device Bluetooth 5.3 Multipoint Pairing',
    ],
    specs: {
      Brand: 'SoundVibe',
      Bluetooth: 'v5.3 with AAC/aptX Codec',
      BatteryLife: '40 Hours (ANC Off), 30 Hours (ANC On)',
      DriverSize: '40mm Custom Titanium Drivers',
      Warranty: '1 Year Brand Warranty',
    },
    reviews: [
      {
        id: 'r5',
        userName: 'Ananya Roy',
        rating: 5,
        comment: 'Noise cancellation is incredible for this price. Battery lasts for days!',
        date: '10 Sep 2026',
      },
    ],
  },

  {
    id: '5',
    name: 'OLED Smart Fitness Watch',
    price: '₹5,999',
    originalPrice: '₹9,999',
    discountPercent: 40,
    priceValue: 5999,
    category: 'Smart Gadgets',
    rating: 4.6,
    reviewCount: 85,
    description:
      '1.43-inch Always-on AMOLED display with heart rate, SpO2, sleep tracking, Bluetooth calling, and over 100 sports workout modes.',
    image:
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1000',
    ],
    highlights: [
      '1.43” Ultra-Bright AMOLED Always-On Display',
      '24/7 Heart Rate, SpO2 & Sleep Tracker',
      'Crystal Clear Bluetooth Phone Calling',
      'IP68 Dust & Water Proof Rating',
    ],
    specs: {
      Brand: 'PulseTech',
      Display: '1.43 inch AMOLED 466x466 px',
      Battery: 'Up to 7 Days Normal Use',
      Sensors: 'PPG Heart Rate, 3-Axis Gyro, SpO2',
      Warranty: '1 Year Warranty',
    },
    reviews: [
      {
        id: 'r6',
        userName: 'Vikram S.',
        rating: 4.5,
        comment: 'Crisp display and accurate step tracking. Calling works seamlessly.',
        date: '20 Sep 2026',
      },
    ],
  },

  {
    id: '6',
    name: 'Slim RFID Leather Wallet',
    price: '₹1,499',
    originalPrice: '₹2,499',
    discountPercent: 40,
    priceValue: 1499,
    category: 'Accessories',
    rating: 4.5,
    reviewCount: 64,
    description:
      'Ultra-thin genuine leather bifold wallet with built-in RFID blocking technology to safeguard your cards and credentials.',
    image:
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=1000',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=1000',
      'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=1000',
    ],
    highlights: [
      'Certified RFID Blocking Technology',
      'Holds up to 8 Cards + Full-length Cash Slot',
      'Slim profile fits comfortably in front pockets',
      'Handcrafted with top-grain distressed leather',
    ],
    specs: {
      Brand: 'UrbanHide',
      Material: 'Top-grain Distressed Leather',
      Capacity: '8 Cards + ID Window + Cash',
      Dimensions: '11 x 8.5 x 1.2 cm',
      Warranty: '1 Year Warranty',
    },
    reviews: [
      {
        id: 'r7',
        userName: 'Suresh Rao',
        rating: 4.5,
        comment: 'Very slim and fits easily in front pocket without bulk.',
        date: '05 Sep 2026',
      },
    ],
  },
];

export const categories = [
  'All',
  'Watches',
  'Bags',
  'Shoes',
  'Electronics',
  'Smart Gadgets',
  'Accessories',
];

export const sortOptions = [
  'Default',
  'Price: Low to High',
  'Price: High to Low',
  'Rating: High to Low',
];