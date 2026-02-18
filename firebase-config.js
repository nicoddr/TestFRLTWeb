// Firebase Configuration
// IMPORTANT: Replace the following values with your own Firebase project configuration
// You can find these values in your Firebase Console > Project Settings > General > Your Apps
const firebaseConfig = {
    apiKey: "AIzaSyAIPJdYfUvL5U2GOtwEPPZQiIs4hCtIzPc", // Still required for full functionality, check console if errors persist
    authDomain: "ifli-f7f9f.firebaseapp.com",
    databaseURL: "https://ifli-f7f9f-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ifli-f7f9f",
    storageBucket: "ifli-f7f9f.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
// We need to wait for the scripts to load in the HTML, so we check if firebase is defined
let app, database;

try {
    app = firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Error initializing Firebase:", error);
    console.log("Make sure you have replaced the placeholders in firebase-config.js with your actual Firebase config.");
}
