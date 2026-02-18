// Firebase Configuration
// IMPORTANT: Replace the following values with your own Firebase project configuration
// You can find these values in your Firebase Console > Project Settings > General > Your Apps
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.europe-west1.firebasedatabase.app", // Or .firebaseio.com
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
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
