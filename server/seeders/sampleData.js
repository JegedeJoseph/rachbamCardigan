import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import ShippingRate from '../models/ShippingRate.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'Classic Wool Cardigan',
    description: 'Premium quality wool cardigan perfect for Nigerian weather. Soft, comfortable, and stylish.',
    price: 15000,
    category: 'Cardigan',
    featured: true,
    variants: [
      { size: 'Small', color: 'Burgundy Wool', stock: 20 },
      { size: 'Medium', color: 'Burgundy Wool', stock: 25 },
      { size: 'Large', color: 'Burgundy Wool', stock: 30 },
      { size: 'Small', color: 'Navy Blue', stock: 15 },
      { size: 'Medium', color: 'Navy Blue', stock: 20 },
      { size: 'Large', color: 'Navy Blue', stock: 18 },
    ],
    images: []
  },
  {
    name: 'Cotton Blend Cardigan',
    description: 'Lightweight cotton blend cardigan ideal for everyday wear. Breathable and comfortable.',
    price: 12000,
    category: 'Cardigan',
    featured: false,
    variants: [
      { size: 'Small', color: 'Charcoal Grey', stock: 15 },
      { size: 'Medium', color: 'Charcoal Grey', stock: 20 },
      { size: 'Large', color: 'Charcoal Grey', stock: 22 },
      { size: 'Small', color: 'Cream White', stock: 12 },
      { size: 'Medium', color: 'Cream White', stock: 18 },
    ],
    images: []
  },
  {
    name: 'Premium Cashmere Cardigan',
    description: 'Luxurious cashmere cardigan for the discerning customer. Ultimate comfort and elegance.',
    price: 35000,
    category: 'Cardigan',
    featured: true,
    variants: [
      { size: 'Small', color: 'Black', stock: 8 },
      { size: 'Medium', color: 'Black', stock: 10 },
      { size: 'Large', color: 'Black', stock: 12 },
      { size: 'Small', color: 'Camel Brown', stock: 6 },
      { size: 'Medium', color: 'Camel Brown', stock: 8 },
    ],
    images: []
  }
];

const sampleShippingRates = [
  { state: 'Lagos', rate: 2500, estimatedDays: '1-2 business days' },
  { state: 'FCT (Abuja)', rate: 4500, estimatedDays: '2-3 business days' },
  { state: 'Ogun', rate: 3000, estimatedDays: '2-3 business days' },
  { state: 'Rivers', rate: 5000, estimatedDays: '3-5 business days' },
  { state: 'Kano', rate: 5500, estimatedDays: '4-6 business days' },
  { state: 'Oyo', rate: 4000, estimatedDays: '3-4 business days' },
  { state: 'Delta', rate: 4500, estimatedDays: '3-5 business days' },
  { state: 'Edo', rate: 4500, estimatedDays: '3-5 business days' },
  { state: 'Anambra', rate: 5000, estimatedDays: '3-5 business days' },
  { state: 'Enugu', rate: 5000, estimatedDays: '3-5 business days' },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await ShippingRate.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ Inserted ${products.length} sample products`);

    // Insert sample shipping rates
    const rates = await ShippingRate.insertMany(sampleShippingRates);
    console.log(`✅ Inserted ${rates.length} shipping rates`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nSample Products:');
    products.forEach(p => {
      console.log(`  - ${p.name} (₦${p.price.toLocaleString()})`);
    });

    console.log('\nShipping Rates:');
    rates.forEach(r => {
      console.log(`  - ${r.state}: ₦${r.rate.toLocaleString()}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

