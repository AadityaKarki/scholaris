import * as mupdfjs from "mupdf/mupdfjs";
import path from "path";
import fs from "fs";
import { createWorker } from "tesseract.js";
import sharp from "sharp";

/**
 * Extracts text from a PDF file in the uploads folder
 * @param {string} filename - The name of the PDF file in the uploads folder
 * @returns {Promise<string>} The extracted text from the PDF
 */
export async function extractTextFromPDF(filename) {
  try {
    const filePath = path.join(process.cwd(), "uploads", filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${filename} not found in uploads folder`);
    }

    // Read the PDF file
    const pdfData = fs.readFileSync(filePath);

    // Create a new document from the PDF data
    const doc = mupdfjs.PDFDocument.openDocument(pdfData, "application/pdf");

    let extractedText = "";

    // Extract text from each page
    for (let i = 0; i < doc.countPages(); i++) {
      const page = doc.loadPage(i);
      const structured = JSON.parse(page.toStructuredText().asJSON());

      for (const block of structured.blocks) {
        if (block.type === "text") {
          for (const line of block.lines) {
            extractedText += line.text;
          }
        }
      }
    }

    return extractedText.trim();
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error;
  }
}

/**
 * Extracts text and images from a PDF file, including OCR for text in images
 * @param {string} filename - The name of the PDF file in the uploads folder
 * @returns {Promise<string>} The combined text from both PDF content and images
 */
export async function extractTextAndImagesFromPDF(filename) {
  try {
    const filePath = path.join(process.cwd(), "uploads", filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${filename} not found in uploads folder`);
    }

    // Initialize Tesseract worker for OCR
    const worker = await createWorker("eng");

    // Read the PDF file
    const pdfData = fs.readFileSync(filePath);

    // Create a new document from the PDF data
    const doc = mupdfjs.Document.openDocument(pdfData, "application/pdf");

    let extractedContent = "";

    // Process each page
    for (let i = 0; i < doc.countPages(); i++) {
      // Extract regular text
      const page = doc.loadPage(i);

      const structured = JSON.parse(page.toStructuredText().asJSON());

      for (const block of structured.blocks) {
        if (block.type === "text") {
          for (const line of block.lines) {
            extractedContent += line.text.trim();
          }
        }
      }

      // Extract images for OCR

      const imageStack = page.getImages();
      for (const image of imageStack) {
        const img = image.image;
        const pixmap = img.toPixmap();
        const raster = pixmap.asPNG();
        const {
          data: { text: ocrText },
        } = await worker.recognize(raster);

        if (ocrText.trim()) {
          extractedContent += ocrText;
        }
      }
    }

    // Free resources
    await worker.terminate();

    // Combine all content in order of appearance
    return extractedContent.trim();
  } catch (error) {
    console.error("Error extracting content from PDF:", error);
    throw error;
  }
}
