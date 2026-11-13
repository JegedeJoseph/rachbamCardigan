import { db, admin } from '../services/firebase.js';

const lookbooksRef = db.collection('lookbooks');

const formatDoc = (doc) => {
  if (!doc.exists) return null;
  const data = doc.data();
  return { id: doc.id, _id: doc.id, ...data, createdAt: data.createdAt?.toDate(), updatedAt: data.updatedAt?.toDate() };
};

export const lookbookRepository = {
  async find() {
    const snapshot = await lookbooksRef.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(formatDoc);
  },
  async findById(id) {
    const doc = await lookbooksRef.doc(id).get();
    return formatDoc(doc);
  },
  async create(data) {
    const docRef = lookbooksRef.doc();
    const payload = { ...data, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    await docRef.set(payload);
    const doc = await docRef.get();
    return formatDoc(doc);
  },
  async findByIdAndUpdate(id, data) {
    const docRef = lookbooksRef.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    await docRef.update({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    const updated = await docRef.get();
    return formatDoc(updated);
  },
  async findByIdAndDelete(id) {
    const docRef = lookbooksRef.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    await docRef.delete();
    return formatDoc(doc);
  }
};
