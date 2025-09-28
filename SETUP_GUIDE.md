# Plant Care App - Configuration Setup Guide

## Step 1: Firebase Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or "Add project"
3. Name your project (e.g., "plant-care-app")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 1.2 Enable Firestore Database
1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to you)
5. Click "Done"

### 1.3 Get Web App Configuration
1. In Firebase Console, click the gear icon → "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon `</>`
4. Register your app with a nickname (e.g., "Plant Care Web App")
5. Don't check "Also set up Firebase Hosting" (unless you want it)
6. Click "Register app"
7. **COPY the firebaseConfig object** - it looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 2: Gemini AI API Setup

### 2.1 Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Select "Create API key in new project" or choose existing project
4. **COPY the API key** - it starts with "AIzaSy..."

## Step 3: Update Configuration

Once you have both credentials, we'll update the `src/config.js` file with your actual values.

---

## Security Notes:
- These credentials will be visible in your frontend code
- Firebase security rules will protect your data
- For production, consider environment variables
- Never commit real credentials to public repositories