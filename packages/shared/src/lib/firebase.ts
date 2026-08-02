// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsKIpCX-4wUZD9WUKe3N9ykgOqaeKOpzU",
  authDomain: "algo-matrix-waba.firebaseapp.com",
  projectId: "algo-matrix-waba",
  storageBucket: "algo-matrix-waba.firebasestorage.app",
  messagingSenderId: "307673063577",
  appId: "1:307673063577:web:c344e3766b129b99375808",
  measurementId: "G-25FBERH5J7"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
