# Gestir V2 - AI-Powered Fashion Assistant

A complete fashion assistant app built with Firebase, Google AI Studio, and React. Upload photos, detect people, crop images, and get AI-powered outfit suggestions and color capsule wardrobes.

## 🚀 Features

- **Google Authentication**: Sign in with Google
- **Photo Upload**: Upload solo or group photos to Firebase Storage
- **People Detection**: AI-powered person detection with bounding boxes
- **Image Cropping**: Client-side cropping with Canvas API
- **Wardrobe Ingestion**: AI analysis of clothing items using Gemini 2.5 Flash
- **One Spark**: Get exactly one outfit suggestion with explanation
- **Color Goals**: Generate 3-look capsule wardrobes with AI-generated style tiles

## 🛠 Tech Stack

- **Backend**: Firebase (Auth, Firestore, Storage, Hosting, Cloud Functions Node 20)
- **AI**: Google AI Studio SDK (@google/genai) with Gemini 2.5 Flash
- **Frontend**: React + Vite + Tailwind CSS
- **Image Generation**: Imagen 4.0 (for style tiles)

## 📁 Project Structure

```
Gestir/
├── functions/                 # Cloud Functions
│   ├── src/
│   │   ├── index.ts          # Main functions entry point
│   │   ├── types.ts          # TypeScript interfaces
│   │   ├── detectPeople.ts   # People detection endpoint
│   │   ├── ingest.ts         # Wardrobe ingestion endpoint
│   │   ├── spark.ts          # Outfit suggestion endpoint
│   │   └── palette.ts        # Color capsule endpoint
│   ├── package.json
│   └── tsconfig.json
├── web/                      # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Main application pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service layer
│   │   └── types.ts         # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
├── firebase.json            # Firebase configuration
├── firestore.rules         # Firestore security rules
├── storage.rules           # Storage security rules
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Google Cloud account with billing enabled
- Google AI Studio account

### 1. Firebase Setup

```bash
# Login to Firebase
firebase login

# Initialize Firebase project (select your project or create new)
firebase init

# Select the following features:
# - Functions: Configure a Cloud Functions directory
# - Firestore: Configure security rules and indexes files
# - Storage: Configure a security rules file for Cloud Storage
# - Hosting: Configure files for Firebase Hosting

# When prompted:
# - Use existing project or create new
# - Functions: Use existing directory 'functions'
# - Language: TypeScript
# - ESLint: Yes
# - Install dependencies: Yes
```

### 2. Google AI Studio Setup

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" in the top right
4. Create a new API key
5. Copy the API key (you'll need it for the next step)

### 3. Set Firebase Secret

```bash
# Set the Gemini API key as a Firebase secret
firebase functions:secrets:set GEMINI_API_KEY
# Paste your API key when prompted
```

### 4. Install Dependencies

```bash
# Install Cloud Functions dependencies
cd functions
npm install

# Install web app dependencies
cd ../web
npm install
```

### 5. Configure Environment Variables

```bash
# Copy the example environment file
cd web
cp env.example .env.local

# Edit .env.local with your Firebase config
# Get these values from Firebase Console > Project Settings > General > Your apps
```

### 6. Run Locally

```bash
# Start Firebase emulators (from project root)
firebase emulators:start

# In another terminal, start the web app
cd web
npm run dev
```

The app will be available at:
- Web app: http://localhost:3000
- Firebase Emulator UI: http://localhost:4000

### 7. Deploy to Production

```bash
# Deploy Cloud Functions
firebase deploy --only functions

# Deploy web app
cd web
npm run build
cd ..
firebase deploy --only hosting
```

## 🔧 Configuration

### Firebase Configuration

Update your `web/.env.local` with your Firebase project details:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# For local development
VITE_FUNCTIONS_BASE=http://localhost:5001/your_project_id/us-central1

# For production
# VITE_FUNCTIONS_BASE=https://us-central1-your_project_id.cloudfunctions.net
```

### Cloud Functions Endpoints

The app provides these API endpoints:

- `POST /detectPeople` - Detect people in uploaded images
- `POST /ingest` - Analyze and ingest clothing items
- `POST /spark` - Generate outfit suggestions
- `POST /palette` - Create color capsule wardrobes

## 📱 Usage

1. **Sign In**: Use Google authentication to sign in
2. **Upload**: Upload a photo (solo or group) to Firebase Storage
3. **Detect**: AI detects people and shows bounding boxes
4. **Crop**: Click "That's me" to crop your image
5. **Ingest**: AI analyzes your clothing and adds to wardrobe
6. **Spark**: Get AI-powered outfit suggestions
7. **Palette**: Create cohesive color capsule wardrobes

## 🔒 Security

- Firebase Authentication with Google OAuth
- Firestore rules ensure users can only access their own data
- Storage rules restrict access to user-specific uploads
- API keys stored securely in Firebase Secrets

## 🎨 UI/UX Features

- **Frictionless Design**: Intuitive, zero-cognitive-load interface
- **Motion Feedback**: Smooth transitions and loading states
- **Responsive**: Works on desktop and mobile
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Modern Styling**: Clean, professional design with Tailwind CSS

## 🐛 Troubleshooting

### Common Issues

1. **Firebase not initialized**: Run `firebase init` and select the correct project
2. **API key not working**: Ensure the secret is set correctly with `firebase functions:secrets:set GEMINI_API_KEY`
3. **CORS errors**: Make sure you're using the correct Functions base URL in your environment variables
4. **Build errors**: Ensure all dependencies are installed with `npm install`

### Debug Mode

```bash
# View Cloud Functions logs
firebase functions:log

# View emulator logs
firebase emulators:start --debug
```

## 📝 API Schemas

### WardrobeItem
```typescript
interface WardrobeItem {
  id: string;
  userId: string;
  name: string;
  category: string;
  subcategory: string;
  colors: string[];
  materials: string[];
  patterns: string[];
  style: string;
  occasion: string[];
  season: string[];
  brand?: string;
  size?: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### BoundingBox
```typescript
interface BoundingBox {
  x: number; // normalized [0,1]
  y: number; // normalized [0,1]
  w: number; // normalized [0,1]
  h: number; // normalized [0,1]
  caption: string;
  confidence: number;
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using Firebase, Google AI Studio, and React**




