// backend/src/config/firebase.js
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const keyPath = process.env.FIREBASE_KEY_PATH || path.join(process.cwd(), "firebase-key.json");

function loadServiceAccount() {
  if (fs.existsSync(keyPath)) {
    const raw = fs.readFileSync(keyPath, "utf8");
    const json = JSON.parse(raw);
    return {
      project_id: json.project_id,
      client_email: json.client_email,
      private_key: json.private_key,
    };
  }
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error("No hay credenciales Firebase: define FIREBASE_KEY_PATH o variables de entorno.");
  }
  return {
    project_id: FIREBASE_PROJECT_ID,
    client_email: FIREBASE_CLIENT_EMAIL,
    private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };
}

const sa = loadServiceAccount();
if (!sa.project_id || !sa.client_email || !sa.private_key) {
  throw new Error("Credenciales Firebase incompletas (project_id, client_email o private_key faltan).");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      privateKey: sa.private_key,
    }),
  });
  console.log(`✅ Firebase Admin listo: project_id=${sa.project_id}, client_email=${sa.client_email}`);
}

export default admin;
