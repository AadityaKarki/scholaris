import mongoose from "mongoose";

const RAGSchema = new mongoose.Schema({
  document: {
    pageContent: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  embedding: {
    type: [Number],
    required: true,
  },
});
const RAG = mongoose.model("RAG", RAGSchema);
export default RAG;
