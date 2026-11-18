import retrieveAnswer from "../middleware/retrieveAnswers.js";
import Message from "../models/Messages.js";

const MAX_QUESTION_LENGTH = 2000;

export async function answerQuestion(req, res, next) {
  try {
    const question = typeof req.body.question === "string" ? req.body.question.trim() : "";
    if (!question) {
      return res.status(400).json({ success: false, message: "Question is required" });
    }
    if (question.length > MAX_QUESTION_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Questions can be at most ${MAX_QUESTION_LENGTH} characters`,
      });
    }

    const learningSessionId = req.learningSession._id.toString();

    await Message.create({ content: question, learningSessionId, sender: "user", type: "rag" });
    const { answer, sources } = await retrieveAnswer(question, learningSessionId);
    await Message.create({ content: answer, learningSessionId, sender: "bot", type: "rag" });

    return res.status(200).json({
      success: true,
      data: { answer, sources, question, learningSessionId },
    });
  } catch (err) {
    return next(err);
  }
}

export async function getMessages(req, res, next) {
  try {
    const messages = await Message.find({
      learningSessionId: req.learningSession._id.toString(),
    })
      .sort({ timestamp: 1 })
      .select("-__v");

    return res.status(200).json({ success: true, data: messages });
  } catch (err) {
    return next(err);
  }
}
