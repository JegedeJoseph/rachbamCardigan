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
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // 1. Try to load from environment variable (useful for Render/Vercel/Heroku)
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log('✅ Connected to Firebase Firestore (via Environment Variable)');
  } else if (fs.existsSync(serviceAccountPath)) {
    // 2. Fallback to local JSON file
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log('✅ Connected to Firebase Firestore (via Local File)');
  } else {
    console.error('❌ Firebase credentials missing!');
    console.error('   Please set the FIREBASE_SERVICE_ACCOUNT environment variable on your server,');
    console.error('   or ensure firebase-service-account.json exists locally at:', serviceAccountPath);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
  process.exit(1);
}

export { db, admin };
