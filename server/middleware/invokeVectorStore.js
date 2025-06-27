import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import RAG from "../models/RAGdata.js";
export default function invokeVectorStore() {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: "embedding-001", // Gemini embedding model
    apiKey: "AIzaSyDh-PURm6KMxi8TR8WYrBSTTxL76nzRYPw",
  });
  console.log(typeof embeddings);
  const collection = RAG.collection;

  const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
    collection,
    indexName: "vector_index",
    textKey: "pageContent",
    embeddingKey: "embedding",
  });
  return vectorStore;
}
