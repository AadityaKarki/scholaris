import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { learningSessionRoute } from "./routes/startlearningsession.js";
import { learnRoute } from "./routes/learn.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 3000,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const server = app.listen(5000, () =>
  console.log("Server running on Port 5000")
);

app.use("/start-learning", learningSessionRoute);
app.use("/learn", learnRoute);
