import express from "express";
import multer from "multer";
import {
  getConversations,
  initiateSession,
  register,
} from "../controller/startlearning.js";
import { loadPDF } from "../controller/loadPDF.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/initiate-session", upload.single("pdf"), initiateSession);
router.post("/register", register);
router.post("/extract-pdf", loadPDF);
router.get("/conversations/:userId", getConversations);
export { router as learningSessionRoute };
