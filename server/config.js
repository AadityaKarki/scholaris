import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

export const serverDir = path.dirname(fileURLToPath(import.meta.url));

// Load server/.env no matter which folder the server is started from.
dotenv.config({ path: path.join(serverDir, ".env") });

const required = ["MONGO_URI", "GOOGLE_API_KEY", "FIREBASE_PROJECT_ID"];
const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(
    `Missing required environment variables: ${missing.join(", ")}.\n` +
      "Copy server/.env.example to server/.env and fill them in."
  );
  process.exit(1);
}

export const config = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  googleApiKey: process.env.GOOGLE_API_KEY,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  chatModel: process.env.GEMINI_CHAT_MODEL || "gemini-1.5-flash",
  embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || "embedding-001",
  vectorIndexName: process.env.VECTOR_INDEX_NAME || "vector_index",
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB) || 20,
  uploadDir: path.join(serverDir, "uploads"),
};
