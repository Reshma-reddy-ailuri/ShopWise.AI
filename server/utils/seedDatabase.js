const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopwise-ai');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample users data
const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@shopwise.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1-555-0100',
    rewardPoints: 1000,
    addresses: [{
      type: 'work',
      street: '123 Admin Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      isDefault: true
    }],
    preferences: {
      categories: ['Electronics', 'Books'],
      priceRange: { min: 0, max: 2000 },
      brands: ['Apple', 'Samsung', 'Sony']
    },
    emailVerified: true
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    phone: '+1-555-0101',
    rewardPoints: 250,
    addresses: [{
      type: 'home',
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      isDefault: true
    }],
    preferences: {
      categories: ['Electronics', 'Sports & Outdoors'],
      priceRange: { min: 0, max: 1000 },
      brands: ['Nike', 'Apple', 'Adidas']
    },
    emailVerified: true
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    phone: '+1-555-0102',
    rewardPoints: 150,
    addresses: [{
      type: 'home',
      street: '789 Pine Street',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      isDefault: true
    }],
    preferences: {
      categories: ['Clothing', 'Health & Beauty'],
      priceRange: { min: 0, max: 500 },
      brands: ['Nike', 'Levi\'s', 'L\'Oreal']
    },
    emailVerified: true
  }
];

// Sample products data
const products = [
  // Electronics
  {
    name: 'iPhone 15 Pro',
    description: 'The most advanced iPhone yet with titanium design, A17 Pro chip, and professional camera system.',
    shortDescription: 'Latest iPhone with titanium design and A17 Pro chip',
    price: 999,
    originalPrice: 1099,
    category: 'Electronics',
    subcategory: 'Smartphones',
    brand: 'Apple',
    sku: 'IPH15PRO128',
    images: [
      { url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', alt: 'iPhone 15 Pro', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', alt: 'iPhone 15 Pro Back' }
    ],
    stock: 50,
    specifications: [
      { name: 'Display', value: '6.1-inch Super Retina XDR' },
      { name: 'Chip', value: 'A17 Pro' },
      { name: 'Storage', value: '128GB' },
      { name: 'Camera', value: '48MP Main, 12MP Ultra Wide, 12MP Telephoto' }
    ],
    variants: [
      {
        name: 'Color',
        options: [
          { value: 'Natural Titanium', price: 0, stock: 20 },
          { value: 'Blue Titanium', price: 0, stock: 15 },
          { value: 'White Titanium', price: 0, stock: 15 }
        ]
      },
      {
        name: 'Storage',
        options: [
          { value: '128GB', price: 0, stock: 50 },
          { value: '256GB', price: 100, stock: 30 },
          { value: '512GB', price: 300, stock: 20 }
        ]
      }
    ],
    rating: 4.8,
    numReviews: 156,
    isFeatured: true,
    isOnSale: true,
    weight: 0.41,
    dimensions: { length: 5.77, width: 2.78, height: 0.32 }
  },
  {
    name: 'Samsung 65" QLED 4K Smart TV',
    description: 'Experience brilliant colors and sharp details with Quantum Dot technology and smart features.',
    shortDescription: '65-inch QLED 4K Smart TV with Quantum Dot technology',
    price: 899,
    originalPrice: 1199,
    category: 'Electronics',
    subcategory: 'Televisions',
    brand: 'Samsung',
    sku: 'SAM65QLED4K',
    images: [
      { url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500', alt: 'Samsung QLED TV', isPrimary: true }
    ],
    stock: 25,
    specifications: [
      { name: 'Screen Size', value: '65 inches' },
      { name: 'Resolution', value: '4K UHD (3840 x 2160)' },
      { name: 'Display Technology', value: 'QLED' },
      { name: 'Smart Platform', value: 'Tizen OS' }
    ],
    rating: 4.6,
    numReviews: 89,
    isFeatured: true,
    isOnSale: true,
    weight: 55.1,
    shippingClass: 'heavy'
  },
  // Clothing
  {
    name: 'Nike Air Max 270',
    description: 'Comfortable running shoes with Max Air unit for all-day comfort and style.',
    shortDescription: 'Comfortable running shoes with Max Air technology',
    price: 129.99,
    originalPrice: 150,
    category: 'Clothing',
    subcategory: 'Shoes',
    brand: 'Nike',
    sku: 'NIKE270BLK',
    images: [
      { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', alt: 'Nike Air Max 270', isPrimary: true }
    ],
    stock: 100,
    variants: [
      {
        name: 'Size',
        options: [
          { value: '8', price: 0, stock: 15 },
          { value: '9', price: 0, stock: 20 },
          { value: '10', price: 0, stock: 25 },
          { value: '11', price: 0, stock: 20 },
          { value: '12', price: 0, stock: 20 }
        ]
      },
      {
        name: 'Color',
        options: [
          { value: 'Black/White', price: 0, stock: 50 },
          { value: 'Navy/Red', price: 0, stock: 30 },
          { value: 'Gray/Blue', price: 0, stock: 20 }
        ]
      }
    ],
    rating: 4.4,
    numReviews: 234,
    isOnSale: true
  },
  // Home & Garden
  {
    name: 'Instant Pot Duo 7-in-1',
    description: '7-in-1 multi-cooker: pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer.',
    shortDescription: '7-in-1 electric pressure cooker for versatile cooking',
    price: 79.99,
    originalPrice: 99.99,
    category: 'Home & Garden',
    subcategory: 'Kitchen Appliances',
    brand: 'Instant Pot',
    sku: 'INSTPOT7IN1',
    images: [
      { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500', alt: 'Instant Pot', isPrimary: true }
    ],
    stock: 75,
    specifications: [
      { name: 'Capacity', value: '6 Quart' },
      { name: 'Functions', value: '7-in-1 Multi-Cooker' },
      { name: 'Material', value: 'Stainless Steel' },
      { name: 'Warranty', value: '1 Year' }
    ],
    rating: 4.7,
    numReviews: 1205,
    isFeatured: true,
    isOnSale: true
  },
  // Books
  {
    name: 'The Psychology of Money',
    description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel.',
    shortDescription: 'Bestselling book about personal finance and investing psychology',
    price: 14.99,
    originalPrice: 18.99,
    category: 'Books',
    subcategory: 'Business & Finance',
    brand: 'Harriman House',
    sku: 'BOOK-PSYMONEY',
    images: [
      { url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500', alt: 'Book Cover', isPrimary: true }
    ],
    stock: 200,
    specifications: [
      { name: 'Author', value: 'Morgan Housel' },
      { name: 'Pages', value: '256' },
      { name: 'Publisher', value: 'Harriman House' },
      { name: 'Language', value: 'English' }
    ],
    rating: 4.9,
    numReviews: 567,
    isFeatured: true
  },
  // Clothing & Accessories for Virtual Try-On
  {
    name: 'Classic Denim Jacket',
    description: 'A classic denim jacket that never goes out of style. Made from premium cotton denim with a comfortable fit. Features traditional button closure, chest pockets, and side pockets. Perfect for layering over t-shirts or dresses.',
    shortDescription: 'Timeless denim jacket perfect for any season',
    price: 79,
    originalPrice: 99,
    category: 'Clothing',
    subcategory: 'Jackets',
    brand: 'Urban Style',
    sku: 'US-DJ-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500', alt: 'Classic Denim Jacket - Front view', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500', alt: 'Classic Denim Jacket - Back view' }
    ],
    stock: 30,
    specifications: [
      { name: 'Material', value: '100% Cotton Denim' },
      { name: 'Fit', value: 'Regular Fit' },
      { name: 'Closure', value: 'Button Front' },
      { name: 'Care', value: 'Machine Wash Cold' }
    ],
    variants: [
      {
        name: 'Size',
        options: [
          { value: 'S', price: 0, stock: 8 },
          { value: 'M', price: 0, stock: 10 },
          { value: 'L', price: 0, stock: 8 },
          { value: 'XL', price: 0, stock: 4 }
        ]
      }
    ],
    rating: 4.4,
    numReviews: 156,
    isFeatured: true,
    isOnSale: true
  },
  {
    name: 'Aviator Sunglasses',
    description: 'Iconic aviator-style sunglasses with premium metal frame and gradient lenses. Provides 100% UV protection while maintaining a timeless, sophisticated look. Comfortable nose pads and adjustable temples ensure a perfect fit.',
    shortDescription: 'Classic aviator sunglasses with UV protection',
    price: 45,
    originalPrice: 65,
    category: 'Clothing',
    subcategory: 'Eyewear',
    brand: 'SunShield',
    sku: 'SS-AV-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', alt: 'Aviator Sunglasses - Main view', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500', alt: 'Aviator Sunglasses - Side view' }
    ],
    stock: 40,
    specifications: [
      { name: 'Frame Material', value: 'Premium Metal' },
      { name: 'Lens Material', value: 'Polycarbonate' },
      { name: 'UV Protection', value: '100% UV400' },
      { name: 'Frame Width', value: '140mm' }
    ],
    variants: [
      {
        name: 'Lens Color',
        options: [
          { value: 'Gray Gradient', price: 0, stock: 15 },
          { value: 'Brown Gradient', price: 0, stock: 15 },
          { value: 'Blue Mirror', price: 5, stock: 10 }
        ]
      }
    ],
    rating: 4.7,
    numReviews: 203,
    isFeatured: true,
    isOnSale: true
  },
  {
    name: 'Casual Cotton T-Shirt',
    description: 'Soft and comfortable cotton t-shirt perfect for everyday wear. Made from 100% organic cotton with a relaxed fit. Available in multiple colors and sizes.',
    shortDescription: 'Comfortable organic cotton t-shirt for everyday wear',
    price: 24.99,
    originalPrice: 34.99,
    category: 'Clothing',
    subcategory: 'T-Shirts',
    brand: 'EcoWear',
    sku: 'EW-CT-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', alt: 'Cotton T-Shirt - Front view', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500', alt: 'Cotton T-Shirt - Back view' }
    ],
    stock: 50,
    specifications: [
      { name: 'Material', value: '100% Organic Cotton' },
      { name: 'Fit', value: 'Relaxed Fit' },
      { name: 'Neckline', value: 'Crew Neck' },
      { name: 'Care', value: 'Machine Wash Cold' }
    ],
    variants: [
      {
        name: 'Color',
        options: [
          { value: 'White', price: 0, stock: 15 },
          { value: 'Black', price: 0, stock: 15 },
          { value: 'Navy', price: 0, stock: 10 },
          { value: 'Gray', price: 0, stock: 10 }
        ]
      },
      {
        name: 'Size',
        options: [
          { value: 'S', price: 0, stock: 12 },
          { value: 'M', price: 0, stock: 15 },
          { value: 'L', price: 0, stock: 15 },
          { value: 'XL', price: 0, stock: 8 }
        ]
      }
    ],
    rating: 4.5,
    numReviews: 89,
    isFeatured: true,
    isOnSale: true
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create products
    console.log('📦 Creating products...');
    const createdProducts = await Product.create(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Add some reviews to products
    console.log('⭐ Adding product reviews...');
    const sampleReviews = [
      { rating: 5, comment: 'Excellent product! Highly recommended.' },
      { rating: 4, comment: 'Good quality, fast shipping.' },
      { rating: 5, comment: 'Perfect! Exactly what I was looking for.' },
      { rating: 4, comment: 'Great value for money.' },
      { rating: 3, comment: 'Decent product, could be better.' },
      { rating: 5, comment: 'Amazing quality and fast delivery!' }
    ];

    for (const product of createdProducts) {
      const numReviews = Math.floor(Math.random() * 4) + 2; // 2-5 reviews per product
      for (let i = 0; i < numReviews; i++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const randomReview = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];

        product.reviews.push({
          user: randomUser._id,
          name: randomUser.fullName,
          rating: randomReview.rating,
          comment: randomReview.comment
        });
      }
      await product.calculateAverageRating();
    }

    // Create sample cart for John Doe
    console.log('🛒 Creating sample cart...');
    const johnDoe = createdUsers.find(user => user.email === 'john.doe@example.com');
    const sampleCart = new Cart({
      user: johnDoe._id,
      items: [
        {
          product: createdProducts[0]._id, // iPhone
          quantity: 1,
          productSnapshot: {
            name: createdProducts[0].name,
            price: createdProducts[0].price,
            image: createdProducts[0].images[0].url,
            sku: createdProducts[0].sku
          },
          selectedVariants: [
            { name: 'Color', value: 'Natural Titanium', price: 0 },
            { name: 'Storage', value: '128GB', price: 0 }
          ],
          itemPrice: createdProducts[0].price
        }
      ]
    });
    sampleCart.calculateTotals();
    await sampleCart.save();

    console.log('🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Products: ${createdProducts.length}`);
    console.log('\n🔐 Admin Login:');
    console.log('   Email: admin@shopwise.com');
    console.log('   Password: admin123');
    console.log('\n👤 Test User Login:');
    console.log('   Email: john.doe@example.com');
    console.log('   Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
