import { GoogleGenerativeAI } from "@google/generative-ai";
import invokeVectorStore from "./invokeVectorStore.js";
import { config } from "../config.js";

const TOP_K = 5;

export const NOT_FOUND_ANSWER =
  "I couldn't find this in your uploaded material. Try rephrasing the question, " +
  "or upload notes that cover this topic.";

const SYSTEM_INSTRUCTION = `You are Scholaris, a study assistant. Answer the student's question using ONLY the numbered excerpts from their own study material.

Rules:
- Use only information in the excerpts. Do not add outside knowledge, even if you know the answer.
- If the excerpts don't contain the answer, reply with exactly this sentence and nothing else: "${NOT_FOUND_ANSWER}"
- If the excerpts answer only part of the question, answer that part and say what is missing.
- Cite the excerpts you used inline with their numbers, like [1] or [2][3].
- Write in Markdown. Use LaTeX for mathematics.`;

let model = null;

function getModel() {
  if (!model) {
    const genAI = new GoogleGenerativeAI(config.googleApiKey);
    model = genAI.getGenerativeModel({
      model: config.chatModel,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: { maxOutputTokens: 2048, temperature: 0.2 },
    });
  }
  return model;
}

// Numbers the retrieved chunks for the prompt and builds the matching source list.
export function buildContext(docs) {
  const sources = docs.map((doc, i) => ({
    ref: i + 1,
    page: doc.metadata?.pageNumber ?? null,
    source: doc.metadata?.source ?? "Uploaded PDF",
  }));
  const context = docs
    .map((doc, i) => {
      const page = doc.metadata?.pageNumber;
      return `[${i + 1}]${page ? ` (page ${page})` : ""}\n${doc.pageContent}`;
    })
    .join("\n\n---\n\n");
  return { context, sources };
}

// Keeps only the sources the answer actually cites, e.g. "[2]".
export function citedSources(answer, sources) {
  return sources.filter((s) => answer.includes(`[${s.ref}]`));
}

// A short "Sources" line appended to the answer, so the existing chat UI shows it.
export function formatSources(sources) {
  if (sources.length === 0) return "";
  const items = sources.map((s) => `[${s.ref}] ${s.page ? `page ${s.page}` : s.source}`);
  return `\n\n**Sources:** ${items.join(" · ")}`;
}

export default async function retrieveAnswer(question, learningSessionId) {
  // Only search this session's chunks (needs the filter field in the Atlas index).
  const docs = await invokeVectorStore().similaritySearch(question, TOP_K, {
    preFilter: { learningSessionId: { $eq: learningSessionId } },
  });

  // Nothing retrieved: don't ask the model, it would only guess.
  if (docs.length === 0) return { answer: NOT_FOUND_ANSWER, sources: [] };

  const { context, sources } = buildContext(docs);
  const prompt = `Excerpts from the student's material:\n\n${context}\n\nQuestion: ${question}`;

  const result = await getModel().generateContent(prompt);
  const answer = result.response.text().trim();
  if (!answer || answer.includes(NOT_FOUND_ANSWER)) {
    return { answer: NOT_FOUND_ANSWER, sources: [] };
  }

  const used = citedSources(answer, sources);
  return { answer: answer + formatSources(used), sources: used };
}
