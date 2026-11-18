import dotenv from "dotenv";
import LearningSession from "../models/LearningSession.js";
import User from "../models/User.js";

dotenv.config();

export async function initiateSession(req, res) {
  try {
    // Log the uploaded file details
    console.log("File received:", req.file);
    console.log(req.body.title);
    // Create new learning session
    const learningSession = new LearningSession({
      pdfFilename: req.file.filename,
      title: req.body.title,
      userId: req.body.uid,
    });

    // Save to database
    await learningSession.save();

    // Send success response
    res.json({
      message: "Learning session started successfully",
      file: req.file,
      title: req.body.title,
      sessionId: learningSession._id,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      error: "Failed to process request",
      details: error.message,
    });
  }
}
export async function register(req, res) {
  try {
    const userInfo = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ userId: userInfo.userId });
    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
        userId: existingUser.userId,
      });
    }

    // Create new user
    const newUser = new User({
      username: userInfo.username,
      userId: userInfo.userId,
    });

    // Save user to database
    await newUser.save();

    // Send success response
    res.status(201).json({
      message: "User registered successfully",
      user: {
        username: newUser.username,
        userId: newUser.userId,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      error: "Failed to register user",
      details: error.message,
    });
  }
}

export async function getConversations(req, res) {
  try {
    const { userId } = req.params;

    const convos = await LearningSession.find({ userId })
      .sort({ createdAt: -1 }) // Sort by creation date in descending order (most recent first)
      .select("_id pdfFilename title createdAt"); // Select relevant fields

    res.json({
      message: "Conversations retrieved successfully",
      conversations: convos,
    });
  } catch (error) {
    console.error("Error retrieving conversations:", error);
    res.status(500).json({
      error: "Failed to retrieve conversations",
      details: error.message,
    });
  }
}
