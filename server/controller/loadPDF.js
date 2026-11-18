import processPDF from "../middleware/processPDF.js";
import invokeVectorStore from "../middleware/invokeVectorStore.js";

// The session (and so the file name) comes from requireSessionOwner, never
// from the request body, so a client can't point the server at another file.
export async function loadPDF(req, res, next) {
  try {
    const session = req.learningSession;
    if (!session.pdfFilename) {
      return res.status(400).json({ error: "This session has no uploaded PDF" });
    }

    const { chunks, usedOcr } = await processPDF(session.pdfFilename);
    if (chunks.length === 0) {
      return res.status(422).json({ error: "No text could be read from this PDF" });
    }

    const documents = chunks.map((chunk) => ({
      pageContent: chunk.pageContent,
      metadata: {
        learningSessionId: session._id.toString(),
        userId: session.userId,
        source: session.title,
        pageNumber: chunk.metadata?.loc?.pageNumber ?? null,
      },
    }));
    await invokeVectorStore().addDocuments(documents);

    res.status(200).json({
      message: "PDF processed and stored successfully",
      chunks: documents.length,
      usedOcr,
    });
  } catch (err) {
    next(err);
  }
}
