# Sign Language Recognition

A real-time sign language detection and translation web application that uses machine learning to recognize hand gestures and translate them into text. This project combines computer vision, AI, and web technologies to make sign language communication more accessible.


## ✨ Features

- **Real-time Sign Language Detection**: Uses your webcam to recognize sign language gestures in real-time
- **Hand Pose Detection**: Detects and visualizes hand landmarks using MediaPipe
- **Translation**: Translates recognized signs into text using DeepL API
- **User Authentication**: Secure Firebase authentication system
- **Dashboard Analytics**: View statistics and feedback about detection performance
- **Data Persistence**: Store and track sign language detection history
- **Responsive Design**: Works seamlessly on desktop and mobile browsers
- **Offline Support**: Progressive Web App capabilities with offline functionality

## 🛠️ Technologies Used

### Frontend
- **React 18**: Modern JavaScript UI library
- **Redux**: State management
- **React Router**: Client-side routing
- **React Webcam**: Webcam integration

### Machine Learning & Computer Vision
- **MediaPipe**: Pre-trained gesture recognition models
  - Hands model for hand pose detection
  - Gesture Recognizer for sign language recognition

### Backend
- **Node.js & Express**: RESTful API server
- **DeepL API**: Translation service

### Cloud & Authentication
- **Firebase**: Authentication, Firestore database, and hosting
- **Firestore**: NoSQL cloud database

### UI/UX
- **React Icons**: Icon library
- **React Toastify**: Toast notifications
- **CSS3**: Custom styling

### Utilities
- **Redux Thunk**: Async Redux actions
- **UUID**: Unique identifier generation
- **dotenv**: Environment variable management
- **js-cookie**: Cookie management
- **CORS**: Cross-Origin Resource Sharing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download](https://git-scm.com/)
- A **Firebase account** - [Create Account](https://firebase.google.com/)
- A **DeepL API account** (for translation) - [Sign Up](https://www.deepl.com/pro)

## 📦 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/sign-language-recognition.git
cd sign-language-recognition
```

### Step 2: Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will install:
- React and React-related packages
- Redux and Redux Thunk
- Firebase SDK
- MediaPipe vision tasks
- Express and backend dependencies
- Chart.js for analytics visualization

## ⚙️ Configuration

### Step 1: Create Environment Variables

Create a `.env.local` file in the root directory of your project:

```bash
touch .env.local
```

### Step 2: Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
4. Create Firestore Database:
   - Go to Firestore Database
   - Create in production mode (add security rules as needed)
5. Copy your Firebase config credentials

Add the following to `.env.local`:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGE_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Step 3: DeepL API Configuration

1. Sign up for [DeepL API](https://www.deepl.com/pro)
2. Get your API key
3. Add to `.env.local`:

```
REACT_APP_DEEPL_API_KEY=your_deepl_api_key
REACT_APP_DEEPL_API_URL=https://api-free.deepl.com/v2/translate
```

### Step 4: Firebase Deployment Configuration

Update `firebase.json` with your Firebase project credentials if needed.

## 🚀 Running the Project

### Development Mode

The project requires both the React frontend and Node.js backend to run.

#### Terminal 1: Start the React Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`

#### Terminal 2: Start the Express Backend Server

```bash
npm run server
```

The backend API will run at `http://localhost:5005`

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Deploy to Firebase

```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

## 🔍 How It Works

### Sign Detection Flow

1. **User Access**: User opens the application and logs in via Firebase
2. **Webcam Access**: User grants permission to access their webcam
3. **Model Loading**: MediaPipe Gesture Recognizer model loads from `public/models/`
4. **Real-time Detection**: 
   - Video frames are captured from the webcam
   - Hand landmarks are detected using MediaPipe Hands
   - Hand poses are passed to the Gesture Recognizer
   - Recognized gestures are identified
5. **Translation**: Recognized signs are sent to the backend API
6. **Backend Processing**: Express server calls DeepL API to translate gestures to text
7. **Display Results**: Translated text is displayed to the user
8. **Data Storage**: Detection results are stored in Firestore for analytics
9. **Dashboard**: Users can view their detection history and statistics

### Key Components

**Detect Component**: Real-time sign language detection interface using webcam and MediaPipe

**Dashboard**: Analytics and statistics showing:
- Number of signs detected
- Detection success rate
- Historical data visualization
- User feedback

**Authentication**: Firebase Auth ensures only logged-in users can access features

**Redux Store**: Manages application state including:
- User authentication state
- Sign detection data
- Application settings

## 🔌 API Integration

### Backend Endpoints

**POST `/api/translate`**

Translates detected sign text to target language.

Request Body:
```json
{
  "text": "hello",
  "targetLang": "ES"
}
```

Response:
```json
{
  "translatedText": "hola"
}
```

## 📊 Model Information

- **Model**: MediaPipe Gesture Recognizer (pre-trained)
- **Location**: `public/models/sign_language_recognizer.task`
- **Input**: Hand landmarks detected from video frames
- **Output**: Recognized gesture/sign labels

To train a custom model, see the Jupyter notebook:
`Code For Training the Model/SLR_MODEL_TRAINING.ipynb`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Webcam not working
- Check browser permissions for camera access
- Try a different browser
- Ensure HTTPS is used in production

### Model not loading
- Clear browser cache
- Check that model file exists at `public/models/sign_language_recognizer.task`
- Check browser console for errors

### Translation not working
- Verify DeepL API key in `.env.local`
- Check that backend server is running on port 5005
- Verify network connection

### Firebase connection issues
- Check Firebase credentials in `.env.local`
- Ensure Firestore database rules allow read/write operations
- Verify project ID matches

## 📧 Support

For support, questions, or suggestions, please open an issue on the GitHub repository.

## 🌟 Acknowledgments

- **MediaPipe** for providing pre-trained gesture recognition models
- **Firebase** for authentication and database services
- **DeepL** for translation services
- All contributors who have helped improve this project

