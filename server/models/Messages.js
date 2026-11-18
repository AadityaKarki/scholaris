import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  learningSessionId: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
