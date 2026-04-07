import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDmyESKA6eV1LrTRhvWcZe3YcFaV3TygOY",
  authDomain: "bgmi-tournament-14d1d.firebaseapp.com",
  projectId: "bgmi-tournament-14d1d",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);