import express, { Request, Response, Router } from "express";
import { sdk } from "../_core/sdk";
import { storagePut } from "../storage";

const router = Router();
const MAX_FILE_BYTES = 40 * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "text/markdown",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function sanitizeFileName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 140) || "fuente-legal";
}

router.post("/legal-corpus/upload", express.raw({ type: "*/*", limit: "40mb" }), async (req: Request, res: Response) => {
  let user;
  try {
    user = await sdk.authenticateRequest(req);
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!user || user.role !== "admin") return res.status(403).json({ error: "Solo administradores pueden cargar fuentes jurídicas" });
  if (!Buffer.isBuffer(req.body) || req.body.length === 0) return res.status(400).json({ error: "El archivo es obligatorio" });
  if (req.body.length > MAX_FILE_BYTES) return res.status(413).json({ error: "El archivo supera el límite de 40 MB" });

  const contentType = (req.headers["content-type"] || "application/octet-stream").split(";")[0].trim();
  if (!ACCEPTED_TYPES.has(contentType)) return res.status(415).json({ error: "Formato no permitido. Usa PDF, Markdown, TXT o DOCX." });

  const originalFileName = typeof req.headers["x-file-name"] === "string" ? sanitizeFileName(decodeURIComponent(req.headers["x-file-name"])) : "fuente-legal";
  try {
    const stored = await storagePut(`legal-corpus/pe/${user.id}/${Date.now()}-${originalFileName}`, req.body, contentType);
    return res.status(201).json({ key: stored.key, url: stored.url, fileName: originalFileName, contentType, size: req.body.length });
  } catch (error) {
    console.error("Legal corpus upload error:", error);
    return res.status(500).json({ error: "No se pudo conservar el archivo original" });
  }
});

export default router;
