import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDmyESKA6eV1LrTRhvWcZe3YcFaV3TygOY",
  authDomain: "bgmi-tournament-14d1d.firebaseapp.com",
  projectId: "bgmi-tournament-14d1d",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);