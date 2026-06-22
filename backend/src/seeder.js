require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');
const Cart = require('./models/cartModel');
const Wishlist = require('./models/wishlistModel');
const Order = require('./models/orderModel');
const connectDB = require('./config/db');

const subCategoriesData = [
  // under Electronics
  { name: 'Smartphones', description: 'Latest mobile phones and smartphones', parentName: 'Electronics' },
  { name: 'Laptops', description: 'High-performance laptops and notebooks', parentName: 'Electronics' },
  { name: 'Audio Devices', description: 'Headphones, speakers and earbuds', parentName: 'Electronics' },
  { name: 'PC Accessories', description: 'Keyboards, mice, monitors and hubs', parentName: 'Electronics' },
  { name: 'Smart Wearables', description: 'Smartwatches and fitness trackers', parentName: 'Electronics' },
  { name: 'Cameras & Photography', description: 'DSLRs, mirrorless cameras, action cams, and drones', parentName: 'Electronics' },

  // under Clothing
  { name: 'Men\'s Apparel', description: 'T-shirts, shirts, jackets and pants for men', parentName: 'Clothing' },
  { name: 'Women\'s Apparel', description: 'Dresses, skirts, tops and jackets for women', parentName: 'Clothing' },
  { name: 'Footwear', description: 'Running shoes, casual sneakers and boots', parentName: 'Clothing' },
  { name: 'Watches & Accessories', description: 'Analogue watches, wallets, sunglasses and belts', parentName: 'Clothing' },

  // under Home & Kitchen
  { name: 'Kitchenware', description: 'Coffee makers, blenders, air fryers and dining sets', parentName: 'Home & Kitchen' },
  { name: 'Smart Appliances', description: 'Smart thermostats, robot vacuums and air purifiers', parentName: 'Home & Kitchen' },
  { name: 'Furniture', description: 'Sofas, standing desks, coffee tables, and office chairs', parentName: 'Home & Kitchen' },
  { name: 'Home Decor', description: 'Vases, rug sets, table lamps, and scented candles', parentName: 'Home & Kitchen' },

  // under Books
  { name: 'Science Fiction', description: 'Space exploration, futuristic tech and cyberpunk books', parentName: 'Books' },
  { name: 'Computer Science', description: 'Coding, programming languages and technical guides', parentName: 'Books' },
  { name: 'Self-Help', description: 'Motivation, habits, lifestyle and self-improvement books', parentName: 'Books' },
  { name: 'Biography & History', description: 'Biographies of innovators and world history', parentName: 'Books' },
  { name: 'Mystery & Thriller', description: 'Suspenseful novels, detective fiction, and thrillers', parentName: 'Books' },

  // under Sports & Outdoors
  { name: 'Fitness Equipment', description: 'Dumbbells, yoga mats and resistance training gear', parentName: 'Sports & Outdoors' },
  { name: 'Camping & Hiking Gear', description: 'Tents, backpacks, sleeping bags and camping items', parentName: 'Sports & Outdoors' },
  { name: 'Cycling', description: 'Bicycle gear, helmets, and computer accessories', parentName: 'Sports & Outdoors' },
  { name: 'Sports Protective Gear', description: 'Knee pads, elbow sleeves, and support bands', parentName: 'Sports & Outdoors' },

  // under Beauty & Personal Care
  { name: 'Skincare', description: 'Serums, moisturizers, cleansers, and sunscreens', parentName: 'Beauty & Personal Care' },
  { name: 'Haircare', description: 'Shampoos, conditioners, hair masks, and dryers', parentName: 'Beauty & Personal Care' },
  { name: 'Makeup', description: 'Lipsticks, mascaras, face powders, and palettes', parentName: 'Beauty & Personal Care' },
  { name: 'Fragrances', description: 'Colognes, perfumes, and body sprays', parentName: 'Beauty & Personal Care' },

  // under Toys & Games
  { name: 'Board Games', description: 'Strategy games, card games, and party board games', parentName: 'Toys & Games' },
  { name: 'Action Figures', description: 'Collectible action figures and robot models', parentName: 'Toys & Games' },
  { name: 'Educational Toys', description: 'STEM coding kits and solar system model sets', parentName: 'Toys & Games' },
  { name: 'Puzzles', description: '1000-piece landscape jigsaw puzzles and brain teasers', parentName: 'Toys & Games' }
];

const allProductsData = [
  // --- Electronics / Smartphones ---
  {
    name: 'iPhone 15 Pro',
    description: 'Apple iPhone 15 Pro, 256GB, Titanium Blue. Dual camera setup with A17 pro chip.',
    price: 999,
    categoryName: 'Smartphones',
    quantity: 12,
    ratings: 4.8,
    images: [{ url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600', publicId: 'seeder/iphone' }],
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Samsung Galaxy S24 Ultra, 512GB, Titanium Gray. Powered by Galaxy AI with 200MP camera.',
    price: 1299,
    categoryName: 'Smartphones',
    quantity: 15,
    ratings: 4.8,
    images: [{ url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600', publicId: 'seeder/galaxy_s24' }],
  },
  {
    name: 'Google Pixel 8 Pro',
    description: 'Google Pixel 8 Pro, 128GB, Bay Blue. Best-in-class Android camera experience with Google Tensor G3.',
    price: 999,
    categoryName: 'Smartphones',
    quantity: 18,
    ratings: 4.6,
    images: [{ url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600', publicId: 'seeder/pixel_8' }],
  },
  {
    name: 'OnePlus 12',
    description: 'OnePlus 12, 256GB, Silky Black. 120Hz Fluid AMOLED display with 100W SuperVOOC fast charging.',
    price: 799,
    categoryName: 'Smartphones',
    quantity: 20,
    ratings: 4.5,
    images: [{ url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600', publicId: 'seeder/oneplus12' }],
  },
  {
    name: 'Xiaomi 14 Pro',
    description: 'Xiaomi 14 Pro, 512GB, Jade Green. Leica professional optical lens with Snapdragon 8 Gen 3.',
    price: 899,
    categoryName: 'Smartphones',
    quantity: 10,
    ratings: 4.4,
    images: [{ url: 'https://images.unsplash.com/photo-1565849906461-0e443307f8ee?q=80&w=600', publicId: 'seeder/xiaomi14' }],
  },

  // --- Electronics / Laptops ---
  {
    name: 'MacBook Air M2',
    description: 'Supercharged Apple MacBook Air with M2 chip, 8GB RAM, 256GB SSD, Liquid Retina display.',
    price: 1099,
    categoryName: 'Laptops',
    quantity: 8,
    ratings: 4.9,
    images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600', publicId: 'seeder/macbook' }],
  },
  {
    name: 'ROG Zephyrus G14',
    description: 'ASUS ROG Zephyrus G14 Gaming Laptop, AMD Ryzen 9, RTX 4070, 16GB DDR5, 1TB SSD.',
    price: 1599,
    categoryName: 'Laptops',
    quantity: 6,
    ratings: 4.7,
    images: [{ url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600', publicId: 'seeder/zephyrus' }],
  },
  {
    name: 'Dell XPS 13',
    description: 'Dell XPS 13 Laptop, Intel Core i7, 16GB RAM, 512GB SSD, 13.4-inch FHD+ InfinityEdge Display.',
    price: 1199,
    categoryName: 'Laptops',
    quantity: 7,
    ratings: 4.6,
    images: [{ url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=600', publicId: 'seeder/dellxps' }],
  },
  {
    name: 'HP Spectre x360',
    description: 'HP Spectre x360 2-in-1 Laptop, Touchscreen, Intel Evo Core i7, 16GB RAM, 1TB SSD, Stylus included.',
    price: 1399,
    categoryName: 'Laptops',
    quantity: 5,
    ratings: 4.7,
    images: [{ url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=600', publicId: 'seeder/hpspectre' }],
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon',
    description: 'Lenovo ThinkPad X1 Carbon Gen 11, Intel Core i7, 32GB RAM, 1TB SSD, 14-inch Business Laptop.',
    price: 1799,
    categoryName: 'Laptops',
    quantity: 4,
    ratings: 4.8,
    images: [{ url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=600', publicId: 'seeder/thinkpad' }],
  },

  // --- Electronics / Audio Devices ---
  {
    name: 'Sony WH-1000XM4',
    description: 'Wireless industry-leading noise canceling over-ear headphones with microphone.',
    price: 348,
    categoryName: 'Audio Devices',
    quantity: 15,
    ratings: 4.7,
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600', publicId: 'seeder/sony' }],
  },
  {
    name: 'Bose QuietComfort Ultra',
    description: 'Bose QuietComfort Ultra Wireless Noise Cancelling Headphones. Immersion Audio with world-class comfort.',
    price: 429,
    categoryName: 'Audio Devices',
    quantity: 22,
    ratings: 4.8,
    images: [{ url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=600', publicId: 'seeder/bose_qc' }],
  },
  {
    name: 'Apple AirPods Pro 2',
    description: 'Apple AirPods Pro (2nd Generation) Wireless Earbuds with USB-C Charging, Active Noise Cancelling.',
    price: 249,
    categoryName: 'Audio Devices',
    quantity: 35,
    ratings: 4.9,
    images: [{ url: 'https://images.unsplash.com/photo-1588449668365-d15e397f6787?q=80&w=600', publicId: 'seeder/airpods' }],
  },
  {
    name: 'Sennheiser Momentum 4',
    description: 'Sennheiser Momentum 4 Wireless Headphones, 60-Hour Battery Life, Adaptive Noise Cancellation.',
    price: 379,
    categoryName: 'Audio Devices',
    quantity: 14,
    ratings: 4.6,
    images: [{ url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600', publicId: 'seeder/sennheiser' }],
  },
  {
    name: 'JBL Flip 6 Speaker',
    description: 'JBL Flip 6 Portable Bluetooth Speaker, 2-way speaker system, IP67 waterproof and dustproof.',
    price: 129,
    categoryName: 'Audio Devices',
    quantity: 40,
    ratings: 4.5,
    images: [{ url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=600', publicId: 'seeder/jbl' }],
  },

  // --- Electronics / PC Accessories ---
  {
    name: 'Dell UltraSharp Monitor',
    description: '27-inch 4K USB-C Hub Monitor with IPS panel, height adjustment, and rich color accuracy.',
    price: 549,
    categoryName: 'PC Accessories',
    quantity: 10,
    ratings: 4.6,
    images: [{ url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600', publicId: 'seeder/monitor' }],
  },
  {
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical gaming keyboard with brown tactile switches and double-shot PBT keycaps.',
    price: 89,
    categoryName: 'PC Accessories',
    quantity: 25,
    ratings: 4.5,
    images: [{ url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600', publicId: 'seeder/keyboard' }],
  },
  {
    name: 'Logitech MX Master 3S',
    description: 'Logitech MX Master 3S Wireless Performance Mouse. Ergonomic shape, ultra-quiet clicks, 8K DPI.',
    price: 99,
    categoryName: 'PC Accessories',
    quantity: 40,
    ratings: 4.8,
    images: [{ url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=600', publicId: 'seeder/mx_master' }],
  },
  {
    name: 'Razer DeathAdder V3 Pro',
    description: 'Razer DeathAdder V3 Pro Wireless Gaming Mouse, 63g Ultra-lightweight, 30K DPI Optical Sensor.',
    price: 149,
    categoryName: 'PC Accessories',
    quantity: 18,
    ratings: 4.7,
    images: [{ url: 'https://images.unsplash.com/photo-1625842268584-8f3290447036?q=80&w=600', publicId: 'seeder/razer_mouse' }],
  },
  {
    name: 'Elgato Stream Deck MK.2',
    description: 'Elgato Stream Deck MK.2 Studio Controller with 15 customizable LCD keys for stream controls.',
    price: 149,
    categoryName: 'PC Accessories',
    quantity: 12,
    ratings: 4.6,
    images: [{ url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600', publicId: 'seeder/streamdeck' }],
  },

  // --- Electronics / Smart Wearables ---
  {
    name: 'Apple Watch Series 9',
    description: 'Apple Watch Series 9 GPS 45mm Midnight Aluminum Case with Midnight Sport Band.',
    price: 429,
    categoryName: 'Smart Wearables',
    quantity: 15,
    ratings: 4.8,
    images: [{ url: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=600', publicId: 'seeder/applewatch' }],
  },
  {
    name: 'Samsung Galaxy Watch 6',
    description: 'Samsung Galaxy Watch 6 44mm LTE Smartwatch with personalized heart rate zones and sleep tracker.',
    price: 329,
    categoryName: 'Smart Wearables',
    quantity: 16,
    ratings: 4.6,
    images: [{ url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=600', publicId: 'seeder/galaxywatch' }],
  },
  {
    name: 'Garmin Fenix 7 Sapphire',
    description: 'Garmin Fenix 7 Sapphire Solar, Multisport GPS Watch, solar charging, titanium case, black band.',
    price: 799,
    categoryName: 'Smart Wearables',
    quantity: 8,
    ratings: 4.9,
    images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600', publicId: 'seeder/garmin' }],
  },

  // --- Electronics / Cameras & Photography ---
  {
    name: 'Sony Alpha 7 IV',
    description: 'Sony Alpha 7 IV Full-frame Mirrorless Interchangeable Lens Camera, 33MP sensor, 4K 60p.',
    price: 2499,
    categoryName: 'Cameras & Photography',
    quantity: 4,
    ratings: 4.9,
    images: [{ url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600', publicId: 'seeder/sony_a7' }],
  },
  {
    name: 'DJI Mini 4 Pro Drone',
    description: 'DJI Mini 4 Pro Drone with Fly More Combo, under 249g, 4K HDR Video, 34-min Flight Time.',
    price: 1099,
    categoryName: 'Cameras & Photography',
    quantity: 5,
    ratings: 4.8,
    images: [{ url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=600', publicId: 'seeder/dji' }],
  },

  // --- Clothing / Men's Apparel ---
  {
    name: 'Classic Leather Jacket',
    description: 'Premium quality black leather jacket for men. Genuine lambskin leather with inner lining.',
    price: 180,
    categoryName: 'Men\'s Apparel',
    quantity: 10,
    ratings: 4.6,
    images: [{ url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600', publicId: 'seeder/leather_jacket' }],
  },
  {
    name: 'Casual White Tee',
    description: 'Unisex basic plain white t-shirt. Made from 100% organic combed cotton.',
    price: 18,
    categoryName: 'Men\'s Apparel',
    quantity: 50,
    ratings: 4.2,
    images: [{ url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600', publicId: 'seeder/white_tee' }],
  },
  {
    name: 'Classic Blue Jeans',
    description: 'Slim fit blue denim jeans for men. Durable cotton blend with slight stretch.',
    price: 55,
    categoryName: 'Men\'s Apparel',
    quantity: 30,
    ratings: 4.5,
    images: [{ url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600', publicId: 'seeder/jeans' }],
  },
  {
    name: 'Men\'s Slim Fit Blazer',
    description: 'Modern slim fit stretch blazer for men. Ideal for smart-casual and formal wear.',
    price: 120,
    categoryName: 'Men\'s Apparel',
    quantity: 15,
    ratings: 4.4,
    images: [{ url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600', publicId: 'seeder/blazer' }],
  },
  {
    name: 'Merino Wool Sweater',
    description: '100% extrafine Merino wool crewneck sweater. Lightweight warmth and superior comfort.',
    price: 75,
    categoryName: 'Men\'s Apparel',
    quantity: 20,
    ratings: 4.7,
    images: [{ url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600', publicId: 'seeder/sweater' }],
  },

  // --- Clothing / Women's Apparel ---
  {
    name: 'Floral Summer Dress',
    description: 'Lightweight floral print summer dress for women. Comfortable cotton fabric with a belt.',
    price: 45,
    categoryName: 'Women\'s Apparel',
    quantity: 20,
    ratings: 4.4,
    images: [{ url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600', publicId: 'seeder/summer_dress' }],
  },
  {
    name: 'Cashmere Knit Cardigan',
    description: 'Women\'s premium soft 100% cashmere knitted button-up cardigan sweater.',
    price: 110,
    categoryName: 'Women\'s Apparel',
    quantity: 15,
    ratings: 4.7,
    images: [{ url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600', publicId: 'seeder/cashmere_cardigan' }],
  },
  {
    name: 'High-Rise Skinny Jeans',
    description: 'Classic high-rise skinny jeans for women in dark indigo wash. Stretch fit denim.',
    price: 60,
    categoryName: 'Women\'s Apparel',
    quantity: 25,
    ratings: 4.5,
    images: [{ url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600', publicId: 'seeder/skinnyjeans' }],
  },
  {
    name: 'Classic Trench Coat',
    description: 'Double-breasted classic trench coat with adjustable waist belt. Waterproof outer shell.',
    price: 150,
    categoryName: 'Women\'s Apparel',
    quantity: 12,
    ratings: 4.8,
    images: [{ url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600', publicId: 'seeder/trenchcoat' }],
  },

  // --- Clothing / Footwear ---
  {
    name: 'Running Shoes Zoom',
    description: 'Performance running shoes. Breathable mesh upper with active foam cushioning.',
    price: 120,
    categoryName: 'Footwear',
    quantity: 18,
    ratings: 4.7,
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600', publicId: 'seeder/shoes' }],
  },
  {
    name: 'UltraBoost Running Shoes',
    description: 'High-performance running sneakers. Primeknit upper with Boost cushion bounce midsole.',
    price: 180,
    categoryName: 'Footwear',
    quantity: 24,
    ratings: 4.8,
    images: [{ url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600', publicId: 'seeder/ultraboost' }],
  },
  {
    name: 'Classic Leather Loafers',
    description: 'Handcrafted genuine leather penny loafers for men. Soft lining and durable rubber sole.',
    price: 95,
    categoryName: 'Footwear',
    quantity: 15,
    ratings: 4.5,
    images: [{ url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=600', publicId: 'seeder/loafers' }],
  },
  {
    name: 'Waterproof Hiking Boots',
    description: 'All-weather mid-height hiking boots. Ankle support with advanced traction grip sole.',
    price: 135,
    categoryName: 'Footwear',
    quantity: 14,
    ratings: 4.7,
    images: [{ url: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=600', publicId: 'seeder/hikingboots' }],
  },

  // --- Clothing / Watches & Accessories ---
  {
    name: 'Seiko Automatic Dress Watch',
    description: 'Seiko Men\'s Presage Automatic Analog Dress Watch with stainless steel strap and blue dial.',
    price: 399,
    categoryName: 'Watches & Accessories',
    quantity: 10,
    ratings: 4.8,
    images: [{ url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600', publicId: 'seeder/seikowatch' }],
  },
  {
    name: 'Leather Bifold Wallet',
    description: 'Genuine full-grain leather bifold wallet with RFID blocking technology, 8 card slots.',
    price: 35,
    categoryName: 'Watches & Accessories',
    quantity: 30,
    ratings: 4.6,
    images: [{ url: 'https://images.unsplash.com/photo-1627124118317-f2851f358376?q=80&w=600', publicId: 'seeder/wallet' }],
  },
  {
    name: 'Aviator Sunglasses',
    description: 'Polarized classic aviator sunglasses with metal frame. 100% UV protection lenses.',
    price: 85,
    categoryName: 'Watches & Accessories',
    quantity: 25,
    ratings: 4.5,
    images: [{ url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600', publicId: 'seeder/sunglasses' }],
  },

  // --- Home & Kitchen / Kitchenware ---
  {
    name: 'Drip Coffee Maker',
    description: '12-Cup Programmable Coffeemaker with glass carafe and digital display for custom brewing.',
    price: 65,
    categoryName: 'Kitchenware',
    quantity: 14,
    ratings: 4.5,
    images: [{ url: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0c6b?q=80&w=600', publicId: 'seeder/coffee_maker' }],
  },
  {
    name: 'Digital Air Fryer',
    description: '6-Quart XL Air Fryer Oven. Uses rapid hot air circulation to cook healthy meals with 85% less oil.',
    price: 110,
    categoryName: 'Kitchenware',
    quantity: 12,
    ratings: 4.8,
    images: [{ url: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?q=80&w=600', publicId: 'seeder/air_fryer' }],
  },
  {
    name: 'Ceramic Dinner Set',
    description: '16-piece high-quality ceramic dinnerware set. Includes dinner plates, bowls, and mugs.',
    price: 85,
    categoryName: 'Kitchenware',
    quantity: 15,
    ratings: 4.6,
    images: [{ url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=600', publicId: 'seeder/dinner_set' }],
  },
  {
    name: 'High-Speed Blender',
    description: '1200W professional kitchen blender for smoothies, shakes, and ice crushing.',
    price: 99,
    categoryName: 'Kitchenware',
    quantity: 18,
    ratings: 4.7,
    images: [{ url: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?q=80&w=600', publicId: 'seeder/blender' }],
  },

  // --- Home & Kitchen / Smart Appliances ---
  {
    name: 'Robot Vacuum Cleaner',
    description: 'Smart self-charging robot vacuum cleaner. Works with Wi-Fi, alexa, and handles hard floors & carpets.',
    price: 249,
    categoryName: 'Smart Appliances',
    quantity: 6,
    ratings: 4.7,
    images: [{ url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600', publicId: 'seeder/vacuum' }],
  },
  {
    name: 'Smart Thermostat',
    description: 'Energy-saving programmable smart thermostat. Wi-Fi enabled, controlled via phone app.',
    price: 150,
    categoryName: 'Smart Appliances',
    quantity: 9,
    ratings: 4.4,
    images: [{ url: 'https://images.unsplash.com/photo-1565538810844-1e119df18843?q=80&w=600', publicId: 'seeder/thermostat' }],
  },
  {
    name: 'HEPA Air Purifier',
    description: 'True HEPA smart air purifier for home. Filters 99.97% of dust, smoke, and pollen.',
    price: 129,
    categoryName: 'Smart Appliances',
    quantity: 14,
    ratings: 4.7,
    images: [{ url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=600', publicId: 'seeder/airpurifier' }],
  },

  // --- Home & Kitchen / Furniture ---
  {
    name: 'Ergonomic Office Chair',
    description: 'Ergonomic mesh back desk chair with adjustable 3D armrests and lumbar support.',
    price: 199,
    categoryName: 'Furniture',
    quantity: 8,
    ratings: 4.6,
    images: [{ url: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?q=80&w=600', publicId: 'seeder/officechair' }],
  },
  {
    name: 'Standing Desk Frame',
    description: 'Dual-motor electric adjustable height standing desk frame with memory controller.',
    price: 279,
    categoryName: 'Furniture',
    quantity: 6,
    ratings: 4.8,
    images: [{ url: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=600', publicId: 'seeder/standingdesk' }],
  },

  // --- Home & Kitchen / Home Decor ---
  {
    name: 'Ceramic Flower Vase Set',
    description: 'Set of 3 rustic white ceramic vases of different heights for modern tabletop decor.',
    price: 39,
    categoryName: 'Home Decor',
    quantity: 20,
    ratings: 4.5,
    images: [{ url: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=600', publicId: 'seeder/vases' }],
  },
  {
    name: 'Scented Candle Gift Set',
    description: 'Pack of 4 soy wax aromatherapy scented candles: Lavender, Rose, Lemon, and Fig.',
    price: 24,
    categoryName: 'Home Decor',
    quantity: 40,
    ratings: 4.7,
    images: [{ url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=600', publicId: 'seeder/candles' }],
  },

  // --- Books / Science Fiction ---
  {
    name: 'Sci-Fi Chronicles',
    description: 'Paperback sci-fi epic novel. Enter a futuristic galaxy of spacecraft and galactic politics.',
    price: 15,
    categoryName: 'Science Fiction',
    quantity: 25,
    ratings: 4.6,
    images: [{ url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600', publicId: 'seeder/scifi_book' }],
  },
  {
    name: 'Dune Deluxe Edition',
    description: 'Hardcover deluxe collector\'s edition of Frank Herbert\'s Dune. Features gorgeous illustrations.',
    price: 29,
    categoryName: 'Science Fiction',
    quantity: 18,
    ratings: 4.9,
    images: [{ url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600', publicId: 'seeder/dune_book' }],
  },
  {
    name: 'Neuromancer',
    description: 'Neuromancer, the seminal cyberpunk novel by William Gibson. Paperback.',
    price: 14,
    categoryName: 'Science Fiction',
    quantity: 22,
    ratings: 4.7,
    images: [{ url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600', publicId: 'seeder/neuromancer' }],
  },
  {
    name: 'Project Hail Mary',
    description: 'Project Hail Mary, a thrilling space exploration novel by Andy Weir, author of The Martian.',
    price: 18,
    categoryName: 'Science Fiction',
    quantity: 30,
    ratings: 4.9,
    images: [{ url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600', publicId: 'seeder/hailmary' }],
  },

  // --- Books / Computer Science ---
  {
    name: 'Learn Modern JS',
    description: 'Comprehensive guide to JavaScript (ES6+), Node.js, and browser APIs for modern web developers.',
    price: 35,
    categoryName: 'Computer Science',
    quantity: 30,
    ratings: 4.9,
    images: [{ url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600', publicId: 'seeder/js_book' }],
  },
  {
    name: 'Designing Data-Intensive Applications',
    description: 'The definitive guide to system design, database architecture, and distributed services.',
    price: 49,
    categoryName: 'Computer Science',
    quantity: 40,
    ratings: 4.9,
    images: [{ url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600', publicId: 'seeder/ddia' }],
  },
  {
    name: 'Clean Code',
    description: 'Clean Code: A Handbook of Agile Software Craftsmanship by Robert C. Martin.',
    price: 39,
    categoryName: 'Computer Science',
    quantity: 35,
    ratings: 4.8,
    images: [{ url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600', publicId: 'seeder/cleancode' }],
  },

  // --- Books / Self-Help ---
  {
    name: 'Atomic Habits (Hardcover)',
    description: 'Easy & proven way to build good habits & break bad ones, written by James Clear.',
    price: 21,
    categoryName: 'Self-Help',
    quantity: 50,
    ratings: 4.9,
    images: [{ url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600', publicId: 'seeder/atomic_habits' }],
  },
  {
    name: 'Deep Work',
    description: 'Deep Work: Rules for Focused Success in a Distracted World by Cal Newport.',
    price: 19,
    categoryName: 'Self-Help',
    quantity: 25,
    ratings: 4.8,
    images: [{ url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600', publicId: 'seeder/deepwork' }],
  },

  // --- Books / Biography & History ---
  {
    name: 'Steve Jobs',
    description: 'The exclusive biography of Steve Jobs by Walter Isaacson, based on over forty interviews.',
    price: 25,
    categoryName: 'Biography & History',
    quantity: 15,
    ratings: 4.8,
    images: [{ url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600', publicId: 'seeder/stevejobs' }],
  },
  {
    name: 'Sapiens',
    description: 'Sapiens: A Brief History of Humankind by Yuval Noah Harari. Paperback.',
    price: 22,
    categoryName: 'Biography & History',
    quantity: 28,
    ratings: 4.7,
    images: [{ url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600', publicId: 'seeder/sapiens' }],
  },

  // --- Books / Mystery & Thriller ---
  {
    name: 'The Silent Patient',
    description: 'The Silent Patient, a shocking psychological thriller by Alex Michaelides.',
    price: 16,
    categoryName: 'Mystery & Thriller',
    quantity: 20,
    ratings: 4.6,
    images: [{ url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=600', publicId: 'seeder/silentpatient' }],
  },

  // --- Sports & Outdoors / Fitness Equipment ---
  {
    name: 'Non-Slip Yoga Mat',
    description: '6mm thick eco-friendly TPE yoga mat with alignment lines. Non-slip texture on both sides.',
    price: 32,
    categoryName: 'Fitness Equipment',
    quantity: 25,
    ratings: 4.6,
    images: [{ url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=600', publicId: 'seeder/yoga_mat' }],
  },
  {
    name: 'Adjustable Dumbbell Set',
    description: 'Pair of adjustable hand weights, up to 25 lbs each. Durable cast iron design with tray.',
    price: 149,
    categoryName: 'Fitness Equipment',
    quantity: 6,
    ratings: 4.7,
    images: [{ url: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=600', publicId: 'seeder/dumbbell' }],
  },
  {
    name: 'Resistance Loop Bands',
    description: 'Set of 5 heavy-duty latex resistance loop bands with carrying bag and instruction guide.',
    price: 15,
    categoryName: 'Fitness Equipment',
    quantity: 35,
    ratings: 4.5,
    images: [{ url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600', publicId: 'seeder/bands' }],
  },

  // --- Sports & Outdoors / Camping & Hiking Gear ---
  {
    name: '4-Person Camping Tent',
    description: 'Waterproof family camping tent with rainfly, storage pockets, and easy dome setup.',
    price: 115,
    categoryName: 'Camping & Hiking Gear',
    quantity: 8,
    ratings: 4.5,
    images: [{ url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600', publicId: 'seeder/tent' }],
  },
  {
    name: 'Hiking Backpack 50L',
    description: 'Heavy-duty backpack for backpacking and hiking. Ergonomic shoulder support with rain cover.',
    price: 75,
    categoryName: 'Camping & Hiking Gear',
    quantity: 12,
    ratings: 4.6,
    images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600', publicId: 'seeder/backpack' }],
  },
  {
    name: 'Compact Sleeping Bag',
    description: '3-Season warm-weather envelope sleeping bag. Lightweight and waterproof pack sheet.',
    price: 39,
    categoryName: 'Camping & Hiking Gear',
    quantity: 15,
    ratings: 4.4,
    images: [{ url: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=600', publicId: 'seeder/sleepingbag' }],
  },

  // --- Sports & Outdoors / Cycling ---
  {
    name: 'Road Bike Helmet',
    description: 'Specialized lightweight cycling helmet with adjustable chin strap and tail-light.',
    price: 49,
    categoryName: 'Cycling',
    quantity: 18,
    ratings: 4.6,
    images: [{ url: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=600', publicId: 'seeder/bikehelmet' }],
  },

  // --- Beauty & Personal Care / Skincare ---
  {
    name: 'Hyaluronic Acid Serum',
    description: 'Deeply hydrating facial serum with 2% pure hyaluronic acid and Vitamin B5.',
    price: 24,
    categoryName: 'Skincare',
    quantity: 30,
    ratings: 4.7,
    images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600', publicId: 'seeder/serum' }],
  },
  {
    name: 'Mineral Sunscreen SPF 50',
    description: 'Broad spectrum lightweight sunscreen lotion. Non-greasy finish and water resistant.',
    price: 19,
    categoryName: 'Skincare',
    quantity: 40,
    ratings: 4.6,
    images: [{ url: 'https://images.unsplash.com/photo-1556229174-5e42a09e45af?q=80&w=600', publicId: 'seeder/sunscreen' }],
  },

  // --- Beauty & Personal Care / Haircare ---
  {
    name: 'Argan Oil Hair Mask',
    description: 'Deep conditioning treatment mask for dry, damaged hair. Restores shine and softness.',
    price: 22,
    categoryName: 'Haircare',
    quantity: 25,
    ratings: 4.8,
    images: [{ url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=600', publicId: 'seeder/hairmask' }],
  },
  {
    name: 'Ionic Salon Hair Dryer',
    description: '1875W professional blow dryer with ceramic tourmaline technology, 3 heat settings.',
    price: 59,
    categoryName: 'Haircare',
    quantity: 15,
    ratings: 4.5,
    images: [{ url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600', publicId: 'seeder/hairdryer' }],
  },

  // --- Beauty & Personal Care / Makeup ---
  {
    name: 'Matte Liquid Lipstick',
    description: 'Long-lasting high-pigmented velvet matte liquid lipstick. Smudge-proof 16hr wear.',
    price: 18,
    categoryName: 'Makeup',
    quantity: 50,
    ratings: 4.4,
    images: [{ url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600', publicId: 'seeder/lipstick' }],
  },

  // --- Beauty & Personal Care / Fragrances ---
  {
    name: 'Classic Cologne for Men',
    description: 'Fresh citrus and woody aromatic fragrance cologne spray for men. 100ml.',
    price: 65,
    categoryName: 'Fragrances',
    quantity: 15,
    ratings: 4.7,
    images: [{ url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600', publicId: 'seeder/cologne' }],
  },
  {
    name: 'Floral Perfume for Women',
    description: 'Premium sweet jasmine and patchouli elegant parfum spray. 50ml.',
    price: 75,
    categoryName: 'Fragrances',
    quantity: 12,
    ratings: 4.8,
    images: [{ url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600', publicId: 'seeder/perfume' }],
  },

  // --- Toys & Games / Board Games ---
  {
    name: 'Catan Board Game',
    description: 'The legendary settlement and resource trading strategy board game. 3-4 players.',
    price: 49,
    categoryName: 'Board Games',
    quantity: 15,
    ratings: 4.9,
    images: [{ url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=600', publicId: 'seeder/catan' }],
  },
  {
    name: 'Ticket to Ride',
    description: 'Cross-country train adventure board game. Easy-to-learn strategy layout.',
    price: 45,
    categoryName: 'Board Games',
    quantity: 12,
    ratings: 4.8,
    images: [{ url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=600', publicId: 'seeder/tickettoride' }],
  },

  // --- Toys & Games / Action Figures ---
  {
    name: 'Sci-Fi Robot Figurine',
    description: 'Highly detailed 6-inch joints collectible sci-fi combat robot action figure.',
    price: 29,
    categoryName: 'Action Figures',
    quantity: 20,
    ratings: 4.6,
    images: [{ url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600', publicId: 'seeder/robottoy' }],
  },

  // --- Toys & Games / Educational Toys ---
  {
    name: 'STEM Coding Robot',
    description: 'Programmable building blocks toy robot. Introduces kids to drag-and-drop coding.',
    price: 89,
    categoryName: 'Educational Toys',
    quantity: 10,
    ratings: 4.7,
    images: [{ url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600', publicId: 'seeder/codingrobot' }],
  },

  // --- Toys & Games / Puzzles ---
  {
    name: '1000-Piece Forest Puzzle',
    description: 'Challenging jigsaw puzzle featuring a beautiful high-definition vibrant forest scenery.',
    price: 18,
    categoryName: 'Puzzles',
    quantity: 25,
    ratings: 4.5,
    images: [{ url: 'https://images.unsplash.com/photo-1585241936222-79914040854c?q=80&w=600', publicId: 'seeder/puzzle' }],
  }
];

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('--- Cleaning up existing data (Keeping User accounts intact) ---');
    // DO NOT delete users: we preserve registration sessions, admins, and sellers!
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});
    await Order.deleteMany({});
    console.log('Product catalog and order data cleared.');

    // 1. Fetch Existing Sellers from the database
    let sellers = await User.find({ role: 'seller' });
    
    // Fallback: If no sellers exist, fetch ANY user so we can assign ownership without crashing or creating users
    if (sellers.length === 0) {
      console.log('No sellers found in the database. Fetching any user as fallback...');
      const anyUser = await User.findOne({});
      if (!anyUser) {
        throw new Error('No users exist in the database! Please register a user first.');
      }
      sellers = [anyUser];
    } else {
      console.log(`Found ${sellers.length} existing sellers in the database.`);
    }

    // 2. Seeding Parent Categories
    console.log('--- Seeding Parent Categories ---');
    const parentCategoriesData = [
      { name: 'Electronics', description: 'Gadgets, smartphones, laptops, and accessories' },
      { name: 'Clothing', description: 'Fashion apparel for men, women, and kids' },
      { name: 'Home & Kitchen', description: 'Furniture, kitchen appliances, and home decor' },
      { name: 'Books', description: 'Fiction, academics, biography, and self-help books' },
      { name: 'Sports & Outdoors', description: 'Fitness gear, outdoor camping equipment, and sportswear' },
      { name: 'Beauty & Personal Care', description: 'Cosmetics, skincare, haircare, and perfumes' },
      { name: 'Toys & Games', description: 'Fun strategy games, puzzles, and kids educational toys' }
    ];
    const parents = await Category.insertMany(parentCategoriesData);
    console.log('Parent categories seeded.');

    const categoryMap = {};
    parents.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // 3. Seeding Subcategories
    console.log('--- Seeding Subcategories ---');
    for (const sub of subCategoriesData) {
      const parentId = categoryMap[sub.parentName];
      if (parentId) {
        const subcat = await Category.create({
          name: sub.name,
          description: sub.description,
          parent: parentId
        });
        categoryMap[sub.name] = subcat._id;
      }
    }
    console.log('Subcategories seeded successfully.');

    // 4. Seeding Products and linking to Categories and Sellers
    console.log('--- Seeding Products ---');
    const productsToInsert = [];

    for (let i = 0; i < allProductsData.length; i++) {
      const prod = allProductsData[i];
      const categoryId = categoryMap[prod.categoryName];

      if (categoryId) {
        // Distribute among the active sellers (or fallback user)
        const sellerIndex = i % sellers.length;
        const sellerUser = sellers[sellerIndex];

        productsToInsert.push({
          name: prod.name,
          description: prod.description,
          price: prod.price,
          category: categoryId,
          quantity: prod.quantity,
          ratings: prod.ratings,
          images: prod.images,
          user: sellerUser._id
        });
      } else {
        console.warn(`Category mapping failed for product: ${prod.name} (Category: ${prod.categoryName})`);
      }
    }

    await Product.insertMany(productsToInsert);
    console.log(`Successfully seeded ${productsToInsert.length} products distributed among active sellers.`);

    console.log('--- Database Seeding Completed Successfully! ---');
    mongoose.connection.close();
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
