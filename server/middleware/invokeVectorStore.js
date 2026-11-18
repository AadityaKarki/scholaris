import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import RAG from "../models/RAGdata.js";
import { config } from "../config.js";

let vectorStore = null;

// Creates the vector store once and reuses it for every request.
export default function invokeVectorStore() {
  if (!vectorStore) {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: config.embeddingModel,
      apiKey: config.googleApiKey,
    });

    vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
      collection: RAG.collection,
      indexName: config.vectorIndexName,
      textKey: "pageContent",
      embeddingKey: "embedding",
    });
  }
  return vectorStore;
}
