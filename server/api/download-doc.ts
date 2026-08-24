import { Router, Request, Response } from "express";
import { generateDocxBuffer, sanitizeFilename } from "../../lib/docx-utils";
import { getDocumentById, getDocumentLegalCitations, recordUsageEvent } from "../db";
import { sdk } from "../_core/sdk";
import type { User } from "../../drizzle/schema";

const router = Router();

router.get("/download-doc/:documentId", async (req: Request, res: Response) => {
  try {
    // Authenticate user
    let user: User | null = null;
    try {
      user = await sdk.authenticateRequest(req);
    } catch (error) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const documentId = parseInt(req.params.documentId, 10);
    if (isNaN(documentId)) {
      return res.status(400).json({ error: "Invalid document ID" });
    }

    // Get document from database
    const document = await getDocumentById(documentId, user.id);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    const citations = await getDocumentLegalCitations(documentId);

    // Generate DOCX from stored content
    let docxBuffer: Buffer;
    try {
      docxBuffer = await generateDocxBuffer({
        title: document.documentTitle,
        content: document.generatedContent,
        citations: citations.map((citation) => ({ label: citation.citationLabel, sourceUrl: citation.sourceUrl })),
      });
    } catch (docxError) {
      console.error("DOCX generation error:", docxError);
      return res.status(500).json({ error: "Error generating Word document" });
    }

    // Send the file
    const filename = sanitizeFilename(`${document.documentTitle}.docx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", docxBuffer.length);
    res.setHeader("X-Jurisdiction-Id", document.jurisdictionId);
    await recordUsageEvent({ userId: user.id, jurisdictionId: document.jurisdictionId, templateId: document.templateId, eventType: "document_downloaded" });
    res.send(docxBuffer);
  } catch (error) {
    console.error("Download doc error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
