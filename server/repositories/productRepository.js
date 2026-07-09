import { db, admin } from '../services/firebase.js';

const productsRef = db.collection('products');

// Helper to format Firestore document
const formatDoc = (doc) => {
  if (!doc.exists) return null;
  const data = doc.data();
  return { id: doc.id, _id: doc.id, ...data, createdAt: data.createdAt?.toDate(), updatedAt: data.updatedAt?.toDate() };
};

export const productRepository = {
  async find(query = {}) {
    let snapshot;
    // Basic sorting by createdAt desc
    snapshot = await productsRef.orderBy('createdAt', 'desc').get();
    
    return snapshot.docs.map(formatDoc);
  },

  async findById(id) {
    const doc = await productsRef.doc(id).get();
    return formatDoc(doc);
  },

  async create(data) {
    const docRef = productsRef.doc();
    
    // Calculate total stock
    let totalStock = 0;
    if (data.variants && data.variants.length > 0) {
      totalStock = data.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
    }
    
    const productData = {
      ...data,
      totalStock,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await docRef.set(productData);
    const doc = await docRef.get();
    return formatDoc(doc);
  },

  async findByIdAndUpdate(id, data) {
    const docRef = productsRef.doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;

    let updateData = { ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    
    if (data.variants) {
       updateData.totalStock = data.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
    }
    
    await docRef.update(updateData);
    const updatedDoc = await docRef.get();
    return formatDoc(updatedDoc);
  },

  async findByIdAndDelete(id) {
    const docRef = productsRef.doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    await docRef.delete();
    return formatDoc(doc);
  },

  async addImages(id, newImages) {
    const docRef = productsRef.doc(id);
    await docRef.update({
      images: admin.firestore.FieldValue.arrayUnion(...newImages),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const doc = await docRef.get();
    return formatDoc(doc);
  },

  async removeImage(productId, imageId) {
    const docRef = productsRef.doc(productId);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    
    const data = doc.data();
    if (!data.images) return formatDoc(doc);
    
    const newImages = data.images.filter(img => img.publicId !== imageId && img.id !== imageId);
    await docRef.update({ 
      images: newImages,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const updatedDoc = await docRef.get();
    return formatDoc(updatedDoc);
  },

  async findFeatured() {
    const snapshot = await productsRef.where('featured', '==', true).get();
    let products = snapshot.docs.map(formatDoc);
    products = products.filter(p => p.totalStock > 0);
    // Sort descending by createdAt
    products.sort((a, b) => b.createdAt - a.createdAt);
    return products.slice(0, 8);
  },

  async findLowStock() {
    const snapshot = await productsRef.get();
    let products = snapshot.docs.map(formatDoc);
    products = products.filter(p => p.totalStock > 0 && p.totalStock < 10);
    products.sort((a, b) => a.totalStock - b.totalStock);
    return products.slice(0, 10);
  }
};
