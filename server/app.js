import express from "express";
import cors from "cors";
import multer from "multer";
import { config } from "./config.js";
import { learningSessionRoute } from "./routes/startlearningsession.js";
import { learnRoute } from "./routes/learn.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (req, res) => res.json({ ok: true }));
  app.use("/start-learning", learningSessionRoute);
  app.use("/learn", learnRoute);

  // One place to turn errors into responses, so handlers can just call next(err).
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? `PDF is larger than ${config.maxUploadMb} MB`
          : err.message;
      return res.status(400).json({ error: message });
    }
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({
      error: status >= 500 ? "Something went wrong on the server" : err.message,
    });
  });

  return app;
}
