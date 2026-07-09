import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your service account key
const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');

let db;

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    db = admin.firestore();
    console.log('✅ Connected to Firebase Firestore');
  } else {
    console.error('❌ Firebase Service Account key not found at:', serviceAccountPath);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
  process.exit(1);
}

export { db, admin };
