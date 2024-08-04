// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBk65RIQlnXBGIyxAN0vUU1qGY0GLYZ0l0",
  authDomain: "inventory-management-98050.firebaseapp.com",
  projectId: "inventory-management-98050",
  storageBucket: "inventory-management-98050.appspot.com",
  messagingSenderId: "949177319364",
  appId: "1:949177319364:web:9934def02f9e04c399ae91",
  measurementId: "G-0N3VM5GWE7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };