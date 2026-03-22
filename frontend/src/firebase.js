// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCyV-KgdX7_Waog0n1qfHDOhRikn-DsJhE",
  authDomain: "farewellawards-e109f.firebaseapp.com",
  projectId: "farewellawards-e109f",
  storageBucket: "farewellawards-e109f.firebasestorage.app",
  messagingSenderId: "276885644750",
  appId: "1:276885644750:web:b4847dee8123e5656f379f",
  measurementId: "G-NFB72PMLN4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
