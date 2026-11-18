import mongoose from "mongoose";
import LearningSession from "../models/LearningSession.js";

// Loads the learning session named in the request and checks it belongs to the
// signed-in user. Answers 404 rather than 403 so the API doesn't confirm that
// someone else's session ID exists.
export function requireSessionOwner(getSessionId) {
  return async (req, res, next) => {
    const sessionId = getSessionId(req);
    if (!sessionId || !mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({ error: "A valid learning session ID is required" });
    }
    try {
      const session = await LearningSession.findById(sessionId);
      if (!session || session.userId !== req.user.uid) {
        return res.status(404).json({ error: "Learning session not found" });
      }
      req.learningSession = session;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}
