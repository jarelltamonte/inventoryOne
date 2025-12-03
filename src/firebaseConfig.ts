// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCedK-41X6b_Isgr6xatvLqPvS_n65bpQI",
  authDomain: "inventoryone-f7868.firebaseapp.com",
  projectId: "inventoryone-f7868",
  storageBucket: "inventoryone-f7868.firebasestorage.app",
  messagingSenderId: "137486336832",
  appId: "1:137486336832:web:0e0bbd2edad5dada8370a5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);