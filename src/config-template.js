// Firebase Configuration
// REPLACE the values below with your actual Firebase project configuration
export const firebaseConfig = {
  apiKey: "PASTE_YOUR_FIREBASE_API_KEY_HERE",
  authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_PROJECT_ID.appspot.com", 
  messagingSenderId: "PASTE_YOUR_SENDER_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE"
};

// Gemini API Configuration  
// REPLACE with your actual Gemini API key from Google AI Studio
export const GEMINI_API_KEY = "PASTE_YOUR_GEMINI_API_KEY_HERE";

// App Configuration (don't change this)
export const appId = "plants-check-app";

/*
INSTRUCTIONS:
1. Get Firebase config from: https://console.firebase.google.com → Your Project → Project Settings → Your Apps
2. Get Gemini API key from: https://makersuite.google.com/app/apikey  
3. Replace ALL the "PASTE_YOUR_..." placeholders above with actual values
4. Save this file
5. The app will automatically reload and work!
*/