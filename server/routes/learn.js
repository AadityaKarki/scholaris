import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireSessionOwner } from "../middleware/sessionOwner.js";
import { answerQuestion, getMessages } from "../controller/chat.js";

const router = express.Router();

router.use(requireAuth);

router.post(
  "/chat",
  requireSessionOwner((req) => req.body.learningSessionId),
  answerQuestion
);
router.get(
  "/chat/:learningSessionId",
  requireSessionOwner((req) => req.params.learningSessionId),
  getMessages
);

export { router as learnRoute };
