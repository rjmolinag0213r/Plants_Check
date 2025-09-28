# 🌿 Green Guardian - Plant Care App
# Author : Ricardo Jose Molina Gonzalez
## [Github] [Linkedin]
[Linkedin]: https://www.linkedin.com/in/molina1312/
[Github]: https://github.com/rjmolinag0213r

An AI-powered plant care companion that helps you track and maintain your plants using computer vision, smart reminders, and personalized tips.

---

## 🚀 Features

- 🌱 **Plant Identification**: Upload a photo to automatically identify plant species using Google Gemini AI (if API key provided)
- 📊 **Health & Progress Tracking**: Visual progress tracking with history of all your plant check-ins (photos, reports, and tips)
- 💧 **Smart Reminders**: Automated watering and care reminders—never forget to water your plants!
- 🤖 **AI Analysis**: Personalized care tips and health assessments based on your plant's current condition (Gemini AI required)
- 🖥️ **Responsive Design**: Works beautifully on desktop and mobile devices
- 🔒 **Privacy First**: Your data is saved locally in your browser (no cloud required unless you set up Firebase)

---

## 🖼️ Screenshots
<img width="1912" height="911" alt="Green Guardian Photo" src="https://github.com/user-attachments/assets/7ef28579-6783-4535-afc1-dc0d883d22c8" />

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/rjmolinag0213r/Plants_Check.git
cd Plants_Check
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API Keys

#### (A) Google Gemini API *(for AI features)*
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Open `src/config.js` (or copy `src/config.example.js` to `src/config.js`)
4. Add your Gemini API key to `GEMINI_API_KEY`

#### (B) Firebase *(optional - only for sync, not required for local use)*
- If you want cloud sync, add your Firebase config in the same `src/config.js` file.

### 4. Run the Application

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

---

## 📚 How to Use

1. **Add a Plant**: Click "Add a New Plant," enter a name, and upload a plant photo.
2. **Automatic Identification**: If Gemini AI is enabled, species and care info are filled in automatically.
3. **View Details**: Click "View Details" to see your plant's health history and care tips.
4. **Check-in**: Use "Check-in Now" to upload a new photo, update status, and get an updated AI care tip.
5. **Track Progress**: See a full timeline of photos, reports, and advice for each plant.
6. **Smart Reminders**: The app reminds you when it's time to water or check in on your plant.

---

## 🛠️ Technologies Used

- **React 18** – UI and state management
- **Google Gemini AI** – Plant identification and health/care tips
- **Tailwind CSS** – Styling and responsive layout
- **Lucide React** – Modern icons
- **LocalStorage** – For offline data storage
- **Firebase** (optional) – For cloud data sync if configured

---

## 🗂️ Project Structure

```text
src/
├── App.js          # Main application component
├── index.js        # React entry point
├── config.js       # API and app configuration
├── config.example.js  # Sample config file for easy setup
```

---

## 🩺 Troubleshooting

- **AI features not working**: Make sure your Gemini API key is set in `src/config.js`. Without it, app works in manual mode (no automatic ID or AI tips).
- **Image upload issues**: Ensure images are under 10MB (they're automatically compressed).
- **Data loss**: Data is stored locally in your browser; clearing browser data will erase your plants/history unless using Firebase sync.

---

## 🤝 Contributing

This is a demo/learning application. Pull requests are welcome! Feel free to fork and modify for your own use.

---

## 📜 License

[MIT](LICENSE) © rjmolinag0213r

---

## 📬 Contact

Questions or suggestions? Open an issue or contact [rjmolinag0213r on GitHub](https://github.com/rjmolinag0213r).
