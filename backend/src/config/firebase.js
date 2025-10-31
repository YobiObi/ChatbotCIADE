// backend/src/config/firebase.js
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const explicitKeyPath = process.env.FIREBASE_KEY_PATH;

// 1. función para cargar desde archivo (solo si se pidió explícitamente)
function loadFromFile(filePath) {
  const resolved = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`No se encontró el archivo de Firebase en: ${resolved}`);
  }

  const raw = fs.readFileSync(resolved, "utf8");
  const json = JSON.parse(raw);

  return {
    project_id: json.project_id,
    client_email: json.client_email,
    private_key: json.private_key,
  };
}

// 2. función para cargar desde variables de entorno
function loadFromEnv() {
  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
  } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error(
      "No hay credenciales Firebase: define FIREBASE_KEY_PATH o las vars FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY."
    );
  }

  return {
    project_id: FIREBASE_PROJECT_ID,
    client_email: FIREBASE_CLIENT_EMAIL,
    private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };
}

// 3. elegir origen
const serviceAccount = explicitKeyPath
  ? loadFromFile(explicitKeyPath)
  : loadFromEnv();

if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
  throw new Error("Credenciales Firebase incompletas.");
}

// 4. inicializar
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
  });
  console.log(
    `✅ Firebase Admin listo: project_id=${serviceAccount.project_id}, client_email=${serviceAccount.client_email}`
  );
}

export default admin;
