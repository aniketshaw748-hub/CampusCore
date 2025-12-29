// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmFGIpVdjO--cUJKlmEG4xXcwT-lkAOEg",
  authDomain: "campuscore-f2734.firebaseapp.com",
  projectId: "campuscore-f2734",
  storageBucket: "campuscore-f2734.firebasestorage.app",
  messagingSenderId: "1078925101852",
  appId: "1:1078925101852:web:0d80248dd0d5ca548748d9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);