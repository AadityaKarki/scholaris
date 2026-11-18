import processPDF from "../middleware/processPDF.js";
import invokeVectorStore from "../middleware/invokeVectorStore.js";
export async function loadPDF(req, res) {
  try {
    const { learningSessionId, userId, filename } = req.body;

    const allSplits = await processPDF(filename);
    const vectorStore = invokeVectorStore();
    const insertDocs = [];
    allSplits.forEach((splits) => {
      if (!splits.pageContent) {
        console.warn("Warning: Document split missing pageContent:", splits);
        return;
      }
      insertDocs.push({
        pageContent:
          typeof splits.pageContent === "string" ? splits.pageContent : "",
        metadata: {
          source: splits.metadata?.source,
          learningSessionId,
          userId,
        },
      });
    });
    await vectorStore.addDocuments(insertDocs);

    res.status(200).json({ message: "PDF processed and stored successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to process PDF" });
  }
}
