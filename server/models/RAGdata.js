import mongoose from "mongoose";

// Matches what LangChain's MongoDBAtlasVectorSearch writes: the chunk text,
// its embedding, and the chunk's metadata as top-level fields.
const RAGSchema = new mongoose.Schema(
  {
    pageContent: { type: String, required: true },
    embedding: { type: [Number], required: true },
    learningSessionId: { type: String, index: true },
    userId: String,
    source: String,
    pageNumber: Number,
  },
  { strict: false }
);

const RAG = mongoose.model("RAG", RAGSchema);
export default RAG;
