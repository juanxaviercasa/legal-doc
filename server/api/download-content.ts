import { Router, Request, Response } from "express";
import { generateDocxBuffer, sanitizeFilename } from "../../lib/docx-utils";
import { sdk } from "../_core/sdk";
import type { User } from "../../drizzle/schema";

const router = Router();

router.post("/download-content", async (req: Request, res: Response) => {
  let user: User | null = null;
  try {
    user = await sdk.authenticateRequest(req);
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "Documento legal";
  const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
  if (!content) return res.status(400).json({ error: "El contenido del documento es obligatorio" });

  try {
    const docxBuffer = await generateDocxBuffer({ title, content });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${sanitizeFilename(`${title}.docx`)}"`);
    res.setHeader("Content-Length", docxBuffer.length);
    res.send(docxBuffer);
  } catch (error) {
    console.error("Edited content download error:", error);
    res.status(500).json({ error: "Error generando el archivo Word" });
  }
});

export default router;
