// Dummy settings so config.js loads in tests. No test talks to MongoDB, Gemini or Firebase.
process.env.MONGO_URI ||= "mongodb://localhost:27017/scholaris-test";
process.env.GOOGLE_API_KEY ||= "test-key";
process.env.FIREBASE_PROJECT_ID ||= "test-project";
