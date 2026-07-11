import { db, admin } from '../services/firebase.js';
import bcrypt from 'bcryptjs';

const usersRef = db.collection('users');

const formatDoc = (doc) => {
  if (!doc.exists) return null;
  const data = doc.data();
  return { id: doc.id, _id: doc.id, ...data };
};

export const userRepository = {
  async countDocuments() {
    // Compatible with firebase-admin v10+ (which you downgraded to)
    const snapshot = await usersRef.select().get();
    return snapshot.size;
  },

  async findOneByEmail(email) {
    const snapshot = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();
    if (snapshot.empty) return null;
    return formatDoc(snapshot.docs[0]);
  },

  async findById(id) {
    const doc = await usersRef.doc(id).get();
    return formatDoc(doc);
  },

  async create(data) {
    const docRef = usersRef.doc();
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    
    const userData = {
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: data.role || 'admin',
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await docRef.set(userData);
    const doc = await docRef.get();
    return formatDoc(doc);
  },

  async updateLastLogin(id) {
    const docRef = usersRef.doc(id);
    await docRef.update({
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  },

  async updatePassword(id, newPassword) {
    const docRef = usersRef.doc(id);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await docRef.update({
      password: hashedPassword,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  },

  async comparePassword(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
  },

  async findUsers() {
    const snapshot = await usersRef.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(formatDoc);
  },

  async deleteUser(id) {
    await usersRef.doc(id).delete();
  },

  async setResetToken(id, token, expireTime) {
    const docRef = usersRef.doc(id);
    await docRef.update({
      resetPasswordToken: token,
      resetPasswordExpire: expireTime,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  },

  async findByResetToken(token) {
    const snapshot = await usersRef
      .where('resetPasswordToken', '==', token)
      .limit(1)
      .get();
      
    if (snapshot.empty) return null;
    return formatDoc(snapshot.docs[0]);
  },

  async clearResetToken(id) {
    const docRef = usersRef.doc(id);
    await docRef.update({
      resetPasswordToken: admin.firestore.FieldValue.delete(),
      resetPasswordExpire: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
};
