import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const keyPath = process.env.FIREBASE_KEY_PATH || path.join(process.cwd(), 'firebase-key.json');

let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
} catch (err) {
  console.error('No se pudo leer firebase-key.json. Define FIREBASE_KEY_PATH o coloca firebase-key.json en el root.');
  throw err;
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
