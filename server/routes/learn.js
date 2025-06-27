import express from "express";
import { answerQuestion, getMessages } from "../controller/chat.js";
const router = express.Router();

router.post("/chat", answerQuestion);
router.get("/chat/:learningSessionId", getMessages);
export { router as learnRoute };
