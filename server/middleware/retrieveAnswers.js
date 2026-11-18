import { GoogleGenerativeAI } from "@google/generative-ai";
import invokeVectorStore from "./invokeVectorStore.js";

export default async function retrieveAnswer(question, learningSessionId) {
  // Initialize Google Generative AI
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      maxOutputTokens: 4096,
      temperature: 0.3,
    },
  });

  // Get vector store and perform search
  const vectorStore = invokeVectorStore();
  const filter = {
    learningSessionId: learningSessionId,
  };
  const retrievedDocs = await vectorStore.similaritySearch(question, 5, filter);

  // Prepare context from documents
  const docsContent = retrievedDocs
    .map((doc) =>
      typeof doc === "object" && doc.document
        ? doc.document.pageContent
        : doc.pageContent
    )
    .join("\n\n---\n\n");
  console.log(docsContent);
  // Construct the prompt
  const prompt = `Use the contet provided below to answer the question

---

### Question:
${question}

### Context:
${docsContent}
`;

  try {
    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating answer:", error);
    throw new Error(`Failed to generate answer: ${error.message}`);
  }
}
