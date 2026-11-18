import express from "express";
import multer from "multer";
import { config } from "../config.js";
import { requireAuth } from "../middleware/auth.js";
import { requireSessionOwner } from "../middleware/sessionOwner.js";
import {
  getConversations,
  initiateSession,
  register,
} from "../controller/startlearning.js";
import { loadPDF } from "../controller/loadPDF.js";

const router = express.Router();

const upload = multer({
  dest: config.uploadDir,
  limits: { fileSize: config.maxUploadMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") return cb(null, true);
    const err = new Error("Only PDF files can be uploaded");
    err.status = 400;
    return cb(err);
  },
});

// Every route here needs a signed-in user.
router.use(requireAuth);

router.post("/register", register);
router.post("/initiate-session", upload.single("pdf"), initiateSession);
router.post(
  "/extract-pdf",
  requireSessionOwner((req) => req.body.learningSessionId),
  loadPDF
);
router.get("/conversations/:userId", getConversations);

export { router as learningSessionRoute };
