import retrieveAnswer from "../middleware/retrieveAnswers.js";
import Message from "../models/Messages.js";

export async function answerQuestion(req, res) {
  try {
    const { question, learningSessionId } = req.body;

    if (!question || !learningSessionId) {
      return res.status(400).json({
        success: false,
        message: "Question and learning session ID are required",
      });
    }
    const newMessage = new Message({
      content: question,
      learningSessionId,
      sender: "user",
      type: "rag",
    });
    newMessage.save();
    // Get vector store for the learning session
    const answer = await retrieveAnswer(question, learningSessionId);
    const newmsg = new Message({
      content: answer,
      learningSessionId,
      sender: "bot",
      type: "rag",
    });
    newmsg.save();
    return res.status(200).json({
      success: true,
      data: {
        answer,
        question,
        learningSessionId,
      },
    });
  } catch (error) {
    console.error("Error in answerQuestion:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process question",
      error: error.message,
    });
  }
}

export async function getMessages(req, res) {
  try {
    const { learningSessionId } = req.params;

    if (!learningSessionId) {
      return res.status(400).json({
        success: false,
        message: "Learning session ID is required",
      });
    }

    const messages = await Message.find({ learningSessionId })
      .sort({ timestamp: 1 })
      .select("-__v");

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error in getMessages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve messages",
      error: error.message,
    });
  }
}
