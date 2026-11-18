import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { config } from "../config.js";

if (getApps().length === 0) {
  // Verifying ID tokens only needs the project ID, not a service-account key.
  initializeApp({ projectId: config.firebaseProjectId });
}

// Checks the Firebase ID token sent as "Authorization: Bearer <token>" and
// puts the verified user ID on req.user. Handlers must use req.user.uid,
// never a user ID taken from the request body or URL.
export async function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Please sign in first" });
  }
  try {
    const decoded = await getAuth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email };
    return next();
  } catch {
    return res.status(401).json({ error: "Your sign-in has expired. Please sign in again" });
  }
}
