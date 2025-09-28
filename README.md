# Green Guardian - Plant Care App

An AI-powered plant care companion that helps you track and maintain your plants using computer vision and smart reminders.

## Features

- 🌱 **Plant Identification**: Upload photos to automatically identify plant species
- 📊 **Progress Tracking**: Visual progress tracking with AI-powered health assessments
- 💧 **Smart Reminders**: Automated watering and care reminders
- 🤖 **AI Analysis**: Get personalized care tips based on your plant's condition
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Gemini API Key (Optional - for AI features)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Update `src/config.js` with your API key

### 3. Run the Application

```bash
npm start
```

The app will open at `http://localhost:3000`

## How to Use

1. **Add a Plant**: Click "Add a New Plant", provide a name, and upload a photo
2. **View Details**: Click "View Details" to see care history and plant information
3. **Check-in**: Use "Check-in Now" to update your plant's status and get care tips
4. **Track Progress**: View the complete history of your plant's health over time

## Technologies Used

- React 18
- Google Gemini AI
- Lucide React (Icons)
- Tailwind CSS (Styling)

## Project Structure

```text
src/
├── App.js          # Main application component
├── index.js        # React entry point
└── config.js       # API configuration
```

## Troubleshooting

- **AI features not working**: Make sure your Gemini API key is properly set in `src/config.js`
- **Image upload issues**: Ensure images are under 10MB (they're automatically compressed)

## Contributing

This is a demo application. Feel free to fork and modify for your own use!