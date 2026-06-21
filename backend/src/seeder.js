require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');
const Cart = require('./models/cartModel');
const Wishlist = require('./models/wishlistModel');
const Order = require('./models/orderModel');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('--- Cleaning up existing data ---');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});
    await Order.deleteMany({});
    console.log('Database cleared.');

    console.log('--- Seeding Users ---');
    const salt = await bcrypt.genSalt(10);
    const commonPassword = await bcrypt.hash('password123', salt);

    // Create Admin
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: commonPassword,
      role: 'admin',
    });

    // Create 5 Sellers
    const sellers = [];
    for (let i = 1; i <= 5; i++) {
      const seller = await User.create({
        name: `Seller ${i}`,
        email: `seller${i}@example.com`,
        password: commonPassword,
        role: 'seller',
      });
      sellers.push(seller);
    }

    // Create 5 Customers (Users)
    const customers = [];
    for (let i = 1; i <= 5; i++) {
      const customer = await User.create({
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        password: commonPassword,
        role: 'customer',
      });
      customers.push(customer);
    }

    console.log('Users seeded successfully.');

    console.log('--- Seeding Categories ---');
    const categoriesData = [
      { name: 'Electronics', description: 'Gadgets, smartphones, laptops, and accessories' },
      { name: 'Clothing', description: 'Fashion apparel for men, women, and kids' },
      { name: 'Home & Kitchen', description: 'Furniture, kitchen appliances, and home decor' },
      { name: 'Books', description: 'Fiction, academics, biography, and self-help books' },
      { name: 'Sports & Outdoors', description: 'Fitness gear, outdoor camping equipment, and sportswear' },
    ];

    const categories = await Category.insertMany(categoriesData);
    console.log('Categories seeded successfully.');

    console.log('--- Seeding Products ---');
    const productsData = [
      // electronics
      {
        name: 'iPhone 15 Pro',
        description: 'Apple iPhone 15 Pro, 256GB, Titanium Blue. Dual camera setup with A17 pro chip.',
        price: 999,
        category: categories[0]._id,
        quantity: 12,
        ratings: 4.8,
        images: [{ url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600', publicId: 'seeder/iphone' }],
      },
      {
        name: 'MacBook Air M2',
        description: 'Supercharged Apple MacBook Air with M2 chip, 8GB RAM, 256GB SSD, Liquid Retina display.',
        price: 1099,
        category: categories[0]._id,
        quantity: 8,
        ratings: 4.9,
        images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600', publicId: 'seeder/macbook' }],
      },
      {
        name: 'Sony WH-1000XM4',
        description: 'Wireless industry-leading noise canceling over-ear headphones with microphone.',
        price: 348,
        category: categories[0]._id,
        quantity: 15,
        ratings: 4.7,
        images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600', publicId: 'seeder/sony' }],
      },
      {
        name: 'Dell UltraSharp Monitor',
        description: '27-inch 4K USB-C Hub Monitor with IPS panel, height adjustment, and rich color accuracy.',
        price: 549,
        category: categories[0]._id,
        quantity: 10,
        ratings: 4.6,
        images: [{ url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600', publicId: 'seeder/monitor' }],
      },
      {
        name: 'iPad Pro 11-inch',
        description: 'Apple iPad Pro with M2 chip, 128GB, Space Gray, Wi-Fi. Supports Apple Pencil 2nd gen.',
        price: 799,
        category: categories[0]._id,
        quantity: 7,
        ratings: 4.8,
        images: [{ url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600', publicId: 'seeder/ipad' }],
      },
      {
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical gaming keyboard with brown tactile switches and double-shot PBT keycaps.',
        price: 89,
        category: categories[0]._id,
        quantity: 25,
        ratings: 4.5,
        images: [{ url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600', publicId: 'seeder/keyboard' }],
      },

      // clothing
      {
        name: 'Classic Leather Jacket',
        description: 'Premium quality black leather jacket for men. Genuine lambskin leather with inner lining.',
        price: 180,
        category: categories[1]._id,
        quantity: 10,
        ratings: 4.6,
        images: [{ url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600', publicId: 'seeder/leather_jacket' }],
      },
      {
        name: 'Floral Summer Dress',
        description: 'Lightweight floral print summer dress for women. Comfortable cotton fabric with a belt.',
        price: 45,
        category: categories[1]._id,
        quantity: 20,
        ratings: 4.4,
        images: [{ url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600', publicId: 'seeder/summer_dress' }],
      },
      {
        name: 'Running Shoes Zoom',
        description: 'Men’s performance running shoes. Breathable mesh upper with active foam cushioning.',
        price: 120,
        category: categories[1]._id,
        quantity: 18,
        ratings: 4.7,
        images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600', publicId: 'seeder/shoes' }],
      },
      {
        name: 'Casual White Tee',
        description: 'Unisex basic plain white t-shirt. Made from 100% organic combed cotton.',
        price: 18,
        category: categories[1]._id,
        quantity: 50,
        ratings: 4.2,
        images: [{ url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600', publicId: 'seeder/white_tee' }],
      },
      {
        name: 'Classic Blue Jeans',
        description: 'Slim fit blue denim jeans for men. Durable cotton blend with slight stretch.',
        price: 55,
        category: categories[1]._id,
        quantity: 30,
        ratings: 4.5,
        images: [{ url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600', publicId: 'seeder/jeans' }],
      },
      {
        name: 'Knitted Winter Beanie',
        description: 'Warm knitted winter skull cap for men and women. Soft acrylic fibers, stretchable size.',
        price: 12,
        category: categories[1]._id,
        quantity: 40,
        ratings: 4.3,
        images: [{ url: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=600', publicId: 'seeder/beanie' }],
      },

      // home & kitchen
      {
        name: 'Drip Coffee Maker',
        description: '12-Cup Programmable Coffeemaker with glass carafe and digital display for custom brewing.',
        price: 65,
        category: categories[2]._id,
        quantity: 14,
        ratings: 4.5,
        images: [{ url: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0c6b?q=80&w=600', publicId: 'seeder/coffee_maker' }],
      },
      {
        name: 'Digital Air Fryer',
        description: '6-Quart XL Air Fryer Oven. Uses rapid hot air circulation to cook healthy meals with 85% less oil.',
        price: 110,
        category: categories[2]._id,
        quantity: 12,
        ratings: 4.8,
        images: [{ url: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?q=80&w=600', publicId: 'seeder/air_fryer' }],
      },
      {
        name: 'Ceramic Dinner Set',
        description: '16-piece high-quality ceramic dinnerware set. Includes dinner plates, bowls, and mugs.',
        price: 85,
        category: categories[2]._id,
        quantity: 15,
        ratings: 4.6,
        images: [{ url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=600', publicId: 'seeder/dinner_set' }],
      },
      {
        name: 'Professional Blender',
        description: 'High-performance kitchen blender. 1200-watt motor, perfect for smoothies and ice crushing.',
        price: 95,
        category: categories[2]._id,
        quantity: 10,
        ratings: 4.5,
        images: [{ url: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?q=80&w=600', publicId: 'seeder/blender' }],
      },
      {
        name: 'Robot Vacuum Cleaner',
        description: 'Smart self-charging robot vacuum cleaner. Works with Wi-Fi, alexa, and handles hard floors & carpets.',
        price: 249,
        category: categories[2]._id,
        quantity: 6,
        ratings: 4.7,
        images: [{ url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600', publicId: 'seeder/vacuum' }],
      },
      {
        name: 'Smart Thermostat',
        description: 'Energy-saving programmable smart thermostat. Wi-Fi enabled, controlled via phone app.',
        price: 150,
        category: categories[2]._id,
        quantity: 9,
        ratings: 4.4,
        images: [{ url: 'https://images.unsplash.com/photo-1565538810844-1e119df18843?q=80&w=600', publicId: 'seeder/thermostat' }],
      },

      // books
      {
        name: 'Sci-Fi Chronicles',
        description: 'Paperback sci-fi epic novel. Enter a futuristic galaxy of spacecraft and galactic politics.',
        price: 15,
        category: categories[3]._id,
        quantity: 25,
        ratings: 4.6,
        images: [{ url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600', publicId: 'seeder/scifi_book' }],
      },
      {
        name: 'Learn Modern JS',
        description: 'Comprehensive guide to JavaScript (ES6+), Node.js, and browser APIs for modern web developers.',
        price: 35,
        category: categories[3]._id,
        quantity: 30,
        ratings: 4.9,
        images: [{ url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600', publicId: 'seeder/js_book' }],
      },
      {
        name: 'Steve Jobs Biography',
        description: 'The exclusive biography of Steve Jobs, co-founder of Apple, written by Walter Isaacson.',
        price: 22,
        category: categories[3]._id,
        quantity: 15,
        ratings: 4.8,
        images: [{ url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600', publicId: 'seeder/bio_book' }],
      },
      {
        name: 'Healthy Cooking 101',
        description: 'Over 100 quick, easy, and nutritious recipes for clean eating and weight management.',
        price: 19,
        category: categories[3]._id,
        quantity: 20,
        ratings: 4.3,
        images: [{ url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=600', publicId: 'seeder/cook_book' }],
      },
      {
        name: 'Brief History of Time',
        description: 'Stephen Hawking’s classic masterpiece, detailing the universe, black holes, and the Big Bang.',
        price: 16,
        category: categories[3]._id,
        quantity: 18,
        ratings: 4.8,
        images: [{ url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600', publicId: 'seeder/history_book' }],
      },
      {
        name: 'The Power of Habit',
        description: 'Why we do what we do in life and business, written by Charles Duhigg. Best seller.',
        price: 14,
        category: categories[3]._id,
        quantity: 22,
        ratings: 4.7,
        images: [{ url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600', publicId: 'seeder/habit_book' }],
      },

      // sports & outdoors
      {
        name: 'Non-Slip Yoga Mat',
        description: '6mm thick eco-friendly TPE yoga mat with alignment lines. Non-slip texture on both sides.',
        price: 32,
        category: categories[4]._id,
        quantity: 25,
        ratings: 4.6,
        images: [{ url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=600', publicId: 'seeder/yoga_mat' }],
      },
      {
        name: 'Stainless Water Bottle',
        description: 'Double-walled vacuum insulated stainless steel water bottle. Keeps drinks cold for 24 hours.',
        price: 24,
        category: categories[4]._id,
        quantity: 35,
        ratings: 4.8,
        images: [{ url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=600', publicId: 'seeder/water_bottle' }],
      },
      {
        name: '4-Person Camping Tent',
        description: 'Waterproof family camping tent with rainfly, storage pockets, and easy dome setup.',
        price: 115,
        category: categories[4]._id,
        quantity: 8,
        ratings: 4.5,
        images: [{ url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600', publicId: 'seeder/tent' }],
      },
      {
        name: 'Hiking Backpack 50L',
        description: 'Heavy-duty backpack for backpacking and hiking. Ergonomic shoulder support with rain cover.',
        price: 75,
        category: categories[4]._id,
        quantity: 12,
        ratings: 4.6,
        images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600', publicId: 'seeder/backpack' }],
      },
      {
        name: 'Bicycle Helmet Adult',
        description: 'Lightweight safety bike helmet with dial adjustments and built-in rear safety light.',
        price: 45,
        category: categories[4]._id,
        quantity: 15,
        ratings: 4.5,
        images: [{ url: 'https://images.unsplash.com/photo-1557803175-ee7c9ecf638f?q=80&w=600', publicId: 'seeder/helmet' }],
      },
      {
        name: 'Adjustable Dumbbell Set',
        description: 'Pair of adjustable hand weights, up to 25 lbs each. Durable cast iron design with tray.',
        price: 149,
        category: categories[4]._id,
        quantity: 6,
        ratings: 4.7,
        images: [{ url: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=600', publicId: 'seeder/dumbbell' }],
      },
    ];

    // Distribute products among the 5 sellers (6 products per seller)
    for (let i = 0; i < productsData.length; i++) {
      const sellerIndex = i % 5;
      productsData[i].user = sellers[sellerIndex]._id;
    }

    await Product.insertMany(productsData);
    console.log('30 Products seeded successfully.');

    console.log('--- Database Seeding Completed Successfully! ---');
    console.log('\nSeed Access Credentials:');
    console.log('Admin: admin@example.com (Password: password123)');
    console.log('Sellers: seller1@example.com to seller5@example.com (Password: password123)');
    console.log('Customers: customer1@example.com to customer5@example.com (Password: password123)');

    mongoose.connection.close();
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
