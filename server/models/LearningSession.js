import mongoose from "mongoose";

const learningSessionSchema = new mongoose.Schema({
  pdfFilename: String,
  title: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: String,
});

const LearningSession = mongoose.model(
  "LearningSession",
  learningSessionSchema
);

export default LearningSession;
