import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export default async function processPDF(filename) {
  const filePath = path.join(process.cwd(), "uploads", filename);

  // 1. Load PDF
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();

  // 2. Split into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 60,
  });
  const allSplits = await splitter.splitDocuments(docs);

  return allSplits;
}
