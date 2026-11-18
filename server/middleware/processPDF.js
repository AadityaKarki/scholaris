import fs from "fs";
import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { config } from "../config.js";
import { ocrPdfPages } from "../pdfextraction.js";

// If pages average fewer characters than this, the PDF is probably scanned
// images rather than text, so fall back to OCR.
const MIN_CHARS_PER_PAGE = 50;

// Resolves an uploaded file's path. path.basename() strips any directories,
// so a name like "../../.env" can't escape the uploads folder.
export function resolveUploadPath(filename) {
  const safeName = path.basename(String(filename));
  const filePath = path.join(config.uploadDir, safeName);
  if (!safeName || !fs.existsSync(filePath)) {
    const err = new Error("Uploaded PDF not found");
    err.status = 404;
    throw err;
  }
  return filePath;
}

export function looksScanned(pages) {
  if (pages.length === 0) return true;
  const totalChars = pages.reduce((sum, page) => sum + page.pageContent.trim().length, 0);
  return totalChars / pages.length < MIN_CHARS_PER_PAGE;
}

export default async function processPDF(filename) {
  const filePath = resolveUploadPath(filename);

  // One Document per page; LangChain records the page in metadata.loc.pageNumber.
  let pages = await new PDFLoader(filePath).load();
  let usedOcr = false;

  if (looksScanned(pages)) {
    const ocrPages = await ocrPdfPages(filePath);
    pages = ocrPages
      .filter((page) => page.text.trim())
      .map(
        (page) =>
          new Document({
            pageContent: page.text,
            metadata: { loc: { pageNumber: page.pageNumber } },
          })
      );
    usedOcr = true;
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
  });
  const chunks = await splitter.splitDocuments(pages);
  return { chunks, usedOcr };
}
