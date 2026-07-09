import dotenv from 'dotenv';
import { db } from '../services/firebase.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'Classic Wool Cardigan',
    description: 'Premium quality wool cardigan perfect for Nigerian weather. Soft, comfortable, and stylish.',
    price: 15000,
    category: 'Cardigan',
    featured: true,
    variants: [
      { id: 'v1', size: 'Small', color: 'Burgundy Wool', stock: 20 },
      { id: 'v2', size: 'Medium', color: 'Burgundy Wool', stock: 25 },
      { id: 'v3', size: 'Large', color: 'Burgundy Wool', stock: 30 },
      { id: 'v4', size: 'Small', color: 'Navy Blue', stock: 15 },
      { id: 'v5', size: 'Medium', color: 'Navy Blue', stock: 20 },
      { id: 'v6', size: 'Large', color: 'Navy Blue', stock: 18 },
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
      { id: 'v7', size: 'Small', color: 'Charcoal Grey', stock: 15 },
      { id: 'v8', size: 'Medium', color: 'Charcoal Grey', stock: 20 },
      { id: 'v9', size: 'Large', color: 'Charcoal Grey', stock: 22 },
      { id: 'v10', size: 'Small', color: 'Cream White', stock: 12 },
      { id: 'v11', size: 'Medium', color: 'Cream White', stock: 18 },
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
      { id: 'v12', size: 'Small', color: 'Black', stock: 8 },
      { id: 'v13', size: 'Medium', color: 'Black', stock: 10 },
      { id: 'v14', size: 'Large', color: 'Black', stock: 12 },
      { id: 'v15', size: 'Small', color: 'Camel Brown', stock: 6 },
      { id: 'v16', size: 'Medium', color: 'Camel Brown', stock: 8 },
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
    console.log('✅ Connected to Firebase');

    // Clear existing data (products and shippingRates)
    const deleteCollection = async (collectionPath) => {
      const colRef = db.collection(collectionPath);
      const snapshot = await colRef.get();
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    };

    await deleteCollection('products');
    await deleteCollection('shippingRates');
    console.log('🗑️  Cleared existing data');

    // Insert sample products
    const productBatch = db.batch();
    sampleProducts.forEach((product) => {
      const docRef = db.collection('products').doc();
      product.createdAt = new Date();
      product.updatedAt = new Date();
      product.totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
      productBatch.set(docRef, product);
    });
    await productBatch.commit();
    console.log(`✅ Inserted ${sampleProducts.length} sample products`);

    // Insert sample shipping rates
    const rateBatch = db.batch();
    sampleShippingRates.forEach((rate) => {
      const docRef = db.collection('shippingRates').doc();
      rate.stateLower = rate.state.toLowerCase();
      rate.createdAt = new Date();
      rate.updatedAt = new Date();
      rateBatch.set(docRef, rate);
    });
    await rateBatch.commit();
    console.log(`✅ Inserted ${sampleShippingRates.length} shipping rates`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nSample Products:');
    sampleProducts.forEach(p => {
      console.log(`  - ${p.name} (₦${p.price.toLocaleString()})`);
    });

    console.log('\nShipping Rates:');
    sampleShippingRates.forEach(r => {
      console.log(`  - ${r.state}: ₦${r.rate.toLocaleString()}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

