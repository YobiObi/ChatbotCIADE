// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: 'AIzaSyCmJeUNilO4ot84B60kr4WeD1N86VywAC0',
  authDomain: '595369859145',
  projectId: 'ciadeproyect',
  // ...otros campos
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
