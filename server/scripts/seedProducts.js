const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const sampleProducts = [
  {
    name: "Wireless Bluetooth Headphones",
    description: "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
    price: 79.99,
    category: "Electronics",
    brand: "TechSound",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"],
    stock: 50,
    rating: 4.5,
    reviews: 128,
    features: ["Noise Cancellation", "30-hour Battery", "Wireless", "Foldable"]
  },
  {
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracker with heart rate monitoring, GPS, and smartphone connectivity.",
    price: 199.99,
    category: "Electronics",
    brand: "FitTech",
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"],
    stock: 30,
    rating: 4.7,
    reviews: 89,
    features: ["Heart Rate Monitor", "GPS", "Waterproof", "7-day Battery"]
  },
  {
    name: "Organic Cotton T-Shirt",
    description: "Comfortable and sustainable organic cotton t-shirt available in multiple colors.",
    price: 24.99,
    category: "Clothing",
    brand: "EcoWear",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"],
    stock: 100,
    rating: 4.3,
    reviews: 45,
    features: ["Organic Cotton", "Machine Washable", "Multiple Colors", "Sustainable"]
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "Insulated stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12 hours.",
    price: 29.99,
    category: "Home & Garden",
    brand: "HydroLife",
    images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500"],
    stock: 75,
    rating: 4.6,
    reviews: 156,
    features: ["Insulated", "24h Cold", "12h Hot", "BPA Free"]
  },
  {
    name: "Wireless Phone Charger",
    description: "Fast wireless charging pad compatible with all Qi-enabled devices.",
    price: 34.99,
    category: "Electronics",
    brand: "ChargeFast",
    images: ["https://images.unsplash.com/photo-1609592806955-d0ae3d1e4b9e?w=500"],
    stock: 60,
    rating: 4.4,
    reviews: 73,
    features: ["Wireless", "Fast Charging", "Qi Compatible", "LED Indicator"]
  },
  {
    name: "Yoga Mat Premium",
    description: "Non-slip premium yoga mat with extra cushioning for comfortable practice.",
    price: 49.99,
    category: "Sports & Outdoors",
    brand: "ZenFit",
    images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500"],
    stock: 40,
    rating: 4.8,
    reviews: 92,
    features: ["Non-slip", "Extra Cushioning", "Eco-friendly", "Carrying Strap"]
  },
  {
    name: "Coffee Maker Deluxe",
    description: "Programmable coffee maker with built-in grinder and thermal carafe.",
    price: 149.99,
    category: "Home & Garden",
    brand: "BrewMaster",
    images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500"],
    stock: 25,
    rating: 4.5,
    reviews: 67,
    features: ["Built-in Grinder", "Programmable", "Thermal Carafe", "Auto Shut-off"]
  },
  {
    name: "Gaming Mouse RGB",
    description: "High-precision gaming mouse with customizable RGB lighting and programmable buttons.",
    price: 59.99,
    category: "Electronics",
    brand: "GamePro",
    images: ["https://images.unsplash.com/photo-1527814050087-3793815479db?w=500"],
    stock: 45,
    rating: 4.6,
    reviews: 134,
    features: ["RGB Lighting", "Programmable Buttons", "High DPI", "Ergonomic"]
  },
  {
    name: "Skincare Set Natural",
    description: "Complete natural skincare set with cleanser, toner, serum, and moisturizer.",
    price: 89.99,
    category: "Beauty & Personal Care",
    brand: "NaturGlow",
    images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500"],
    stock: 35,
    rating: 4.7,
    reviews: 78,
    features: ["Natural Ingredients", "Complete Set", "All Skin Types", "Cruelty-free"]
  },
  {
    name: "Bluetooth Speaker Portable",
    description: "Waterproof portable Bluetooth speaker with 360-degree sound and 20-hour battery.",
    price: 69.99,
    category: "Electronics",
    brand: "SoundWave",
    images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500"],
    stock: 55,
    rating: 4.4,
    reviews: 101,
    features: ["Waterproof", "360° Sound", "20-hour Battery", "Portable"]
  },
  {
    name: "Running Shoes Athletic",
    description: "Lightweight running shoes with advanced cushioning and breathable mesh upper.",
    price: 119.99,
    category: "Clothing",
    brand: "RunFast",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"],
    stock: 80,
    rating: 4.5,
    reviews: 167,
    features: ["Lightweight", "Advanced Cushioning", "Breathable", "Durable"]
  },
  {
    name: "Desk Lamp LED",
    description: "Adjustable LED desk lamp with touch control and USB charging port.",
    price: 39.99,
    category: "Home & Garden",
    brand: "BrightLight",
    images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500"],
    stock: 65,
    rating: 4.3,
    reviews: 54,
    features: ["LED", "Touch Control", "USB Charging", "Adjustable"]
  }
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${products.length} sample products`);

    console.log('Sample products added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
