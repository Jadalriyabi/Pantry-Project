// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACV3X5ndrpAyF94Ox-vPm6rObi3eld3VE",
  authDomain: "inventory-managment-78375.firebaseapp.com",
  projectId: "inventory-managment-78375",
  storageBucket: "inventory-managment-78375.appspot.com",
  messagingSenderId: "744727686891",
  appId: "1:744727686891:web:9e360203649d7c616318ae",
  measurementId: "G-N6S7CLLPX3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore};