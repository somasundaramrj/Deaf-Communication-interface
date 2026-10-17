import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyB-XUVmUnXhWlOEH39-JfLv6Kc4cThYz8E",
  authDomain: "call-f9a33.firebaseapp.com",
  projectId: "call-f9a33",
  storageBucket: "call-f9a33.firebasestorage.app",
  messagingSenderId: "821446110738",
  appId: "1:821446110738:web:578e2d999825e0598232cb",
  measurementId: "G-X8YRKZHGXS"
};
const app = initializeApp(firebaseConfig);

// Initialize Firestore and export
export const db = getFirestore(app);