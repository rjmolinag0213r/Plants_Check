// Firebase Configuration - SAMPLE
// Replace these with your actual Firebase project configuration
export const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Gemini API Configuration - SAMPLE
// Get your API key from: https://makersuite.google.com/app/apikey
export const GEMINI_API_KEY = "your-gemini-api-key-here";

// App Configuration
export const appId = "plants-check-app";

/*
SETUP INSTRUCTIONS:

1. Firebase Setup:
   - Go to https://console.firebase.google.com
   - Create a new project
   - Enable Firestore Database
   - Go to Project Settings → General → Your apps
   - Add a web app and copy the config object above

2. Gemini API Setup:
   - Go to https://makersuite.google.com/app/apikey
   - Create a new API key
   - Replace GEMINI_API_KEY above

3. Replace the placeholder values with your actual credentials
*/