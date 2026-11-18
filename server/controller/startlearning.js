import LearningSession from "../models/LearningSession.js";
import User from "../models/User.js";

export async function initiateSession(req, res, next) {
  try {
    const learningSession = await LearningSession.create({
      pdfFilename: req.file ? req.file.filename : null,
      title: (req.body.title || "").trim() || "Untitled session",
      userId: req.user.uid, // from the verified token, never from the request body
    });

    res.status(201).json({
      message: "Learning session started successfully",
      sessionId: learningSession._id,
      title: learningSession.title,
      hasPdf: Boolean(req.file),
    });
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  try {
    const userId = req.user.uid;
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      // Registering twice is harmless, so treat it as success.
      return res.status(200).json({
        message: "User already registered",
        user: { username: existingUser.username, userId },
      });
    }

    const username =
      (req.body.username || "").trim() || (req.user.email || "").split("@")[0] || "student";
    const newUser = await User.create({ username, userId });

    res.status(201).json({
      message: "User registered successfully",
      user: { username: newUser.username, userId },
    });
  } catch (err) {
    next(err);
  }
}

export async function getConversations(req, res, next) {
  try {
    if (req.params.userId !== req.user.uid) {
      return res.status(403).json({ error: "You can only view your own conversations" });
    }

    const conversations = await LearningSession.find({ userId: req.user.uid })
      .sort({ createdAt: -1 })
      .select("_id title createdAt");

    res.json({ message: "Conversations retrieved successfully", conversations });
  } catch (err) {
    next(err);
  }
}
