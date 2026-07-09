import { db, admin } from '../services/firebase.js';

const shippingRef = db.collection('shippingRates');

const formatDoc = (doc) => {
  if (!doc.exists) return null;
  const data = doc.data();
  return { id: doc.id, _id: doc.id, ...data };
};

export const shippingRateRepository = {
  async find() {
    const snapshot = await shippingRef.orderBy('state', 'asc').get();
    return snapshot.docs.map(formatDoc);
  },

  async findOneByState(state) {
    // Firestore doesn't do case-insensitive regex well, so we search by lowercase state
    const snapshot = await shippingRef.where('stateLower', '==', state.toLowerCase()).limit(1).get();
    if (snapshot.empty) return null;
    return formatDoc(snapshot.docs[0]);
  },

  async findOneAndUpdateByState(state, data) {
    const stateLower = state.toLowerCase();
    const snapshot = await shippingRef.where('stateLower', '==', stateLower).limit(1).get();
    
    if (snapshot.empty) {
      // Create new
      const docRef = shippingRef.doc();
      const newData = {
        ...data,
        state,
        stateLower,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      await docRef.set(newData);
      const doc = await docRef.get();
      return formatDoc(doc);
    } else {
      // Update existing
      const docRef = snapshot.docs[0].ref;
      await docRef.update({
        ...data,
        state,
        stateLower,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      const updatedDoc = await docRef.get();
      return formatDoc(updatedDoc);
    }
  },

  async findByIdAndUpdate(id, data) {
    const docRef = shippingRef.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    
    let updateData = { ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (data.state) {
      updateData.stateLower = data.state.toLowerCase();
    }

    await docRef.update(updateData);
    const updatedDoc = await docRef.get();
    return formatDoc(updatedDoc);
  },

  async findByIdAndDelete(id) {
    const docRef = shippingRef.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    
    await docRef.delete();
    return formatDoc(doc);
  }
};
