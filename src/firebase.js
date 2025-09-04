// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';

// // const firebaseConfig = {
// //   apiKey: 'AIzaSyC35Q0HPN6xxMIa_k48zjh3_rNh0Pndqo8',
// //   authDomain: 'mimiplanner-6a156.firebaseapp.com',
// //   projectId: 'mimiplanner-6a156',
// //   storageBucket: 'mimiplanner-6a156.appspot.com',
// //   messagingSenderId: '471071732487',
// //   appId: '1:471071732487:web:d895db5f94d518c6264ba2',
// //   measurementId: 'G-LSQYHFR99L',
// // };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Firestore
// const db = getFirestore(app);

// export { db };

// Import Firebase and Firestore modules
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database'; // Import for Firebase Realtime Database

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: 'YOUR_API_KEY', // Replace with your actual API key
//   authDomain: 'YOUR_AUTH_DOMAIN', // Replace with your actual Auth domain
//   projectId: 'YOUR_PROJECT_ID', // Replace with your actual Project ID
//   storageBucket: 'YOUR_STORAGE_BUCKET', // Replace with your actual Storage bucket
//   messagingSenderId: 'YOUR_MESSAGING_SENDER_ID', // Replace with your actual Messaging sender ID
//   appId: 'YOUR_APP_ID', // Replace with your actual App ID
// };

// Example Firebase configuration (replace with your actual configuration)
const firebaseConfig = {
  apiKey: 'AIzaSyC35Q0HPN6xxMIa_k48zjh3_rNh0Pndqo8',
  authDomain: 'mimiplanner-6a156.firebaseapp.com',
  databaseURL:
    'https://mimiplanner-6a156-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'mimiplanner-6a156',
  storageBucket: 'mimiplanner-6a156.appspot.com',
  messagingSenderId: '471071732487',
  appId: '1:471071732487:web:d895db5f94d518c6264ba2',
  measurementId: 'G-LSQYHFR99L',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Realtime Database (Optional, if you are using it)
const realTimeDb = getDatabase(app);
console.log('Firebase Initialized:', app.name); // Should print "[DEFAULT]"

export { db, realTimeDb };
