import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/*
  Firebase configuration for the web app.
  This initializes:
  - Firebase App
  - Firebase Authentication
  - Google Sign-In provider
  - Firestore database
*/

const firebaseConfig = {
  apiKey: "AIzaSyBZZB1XTUU_PAPBrSNae5EScX7BVeX_vI8",
  authDomain: "wehack2026-24e14.firebaseapp.com",
  projectId: "wehack2026-24e14",
  storageBucket: "wehack2026-24e14.firebasestorage.app",
  messagingSenderId: "719605704671",
  appId: "1:719605704671:web:53ffff1887d7021888866a",
  measurementId: "G-1R7KWB6LRN"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Set up Google Auth provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

// Export services so other files can import them
export { app, auth, db, googleProvider };