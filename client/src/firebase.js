import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5O9KkWg1-WalzACLxsm1WWVQLbgOCSoo",
  authDomain: "login-page-3264b.firebaseapp.com",
  projectId: "login-page-3264b",
  storageBucket: "login-page-3264b.firebasestorage.app",
  messagingSenderId: "749413747391",
  appId: "1:749413747391:web:20c25166d0f391ff1fd40a",
  measurementId: "G-XL70TZJVQV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Analytics (optional - for tracking)
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.log('Analytics not available:', error.message);
}

export { analytics };
export default app; 