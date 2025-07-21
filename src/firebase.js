// src/firebase.js

// Import required SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpTsxGr2TyXLhHzL9Uuc4t_bDsPSn-vPU",
  authDomain: "lostfound-9ba9a.firebaseapp.com",
  projectId: "lostfound-9ba9a",
  storageBucket: "lostfound-9ba9a.firebasestorage.app",
  messagingSenderId: "1003144617449",
  appId: "1:1003144617449:web:c7bfb341653c8710017f78",
  measurementId: "G-TN359YDTTR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// Export Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
