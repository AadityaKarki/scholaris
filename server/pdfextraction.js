import fs from "fs";
import * as mupdf from "mupdf";
import { createWorker } from "tesseract.js";
import { serverDir } from "./config.js";

// Renders each PDF page to an image and reads its text with OCR. Used for
// scanned PDFs, where normal text extraction finds nothing.
// Returns [{ pageNumber, text }], with pages numbered from 1.
export async function ocrPdfPages(filePath) {
  const doc = mupdf.Document.openDocument(fs.readFileSync(filePath), "application/pdf");
  // cachePath points at server/, which holds eng.traineddata, so the language
  // data isn't downloaded again on every run.
  const worker = await createWorker("eng", 1, { cachePath: serverDir });

  try {
    const pages = [];
    for (let i = 0; i < doc.countPages(); i++) {
      const page = doc.loadPage(i);
      // Render at 2x (about 144 DPI) so small text is readable for OCR.
      const pixmap = page.toPixmap(mupdf.Matrix.scale(2, 2), mupdf.ColorSpace.DeviceRGB, false, true);
      const png = pixmap.asPNG();
      const {
        data: { text },
      } = await worker.recognize(Buffer.from(png));
      pages.push({ pageNumber: i + 1, text });
    }
    return pages;
  } finally {
    await worker.terminate();
  }
}
