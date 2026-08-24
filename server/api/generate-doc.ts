import { Router, Request, Response } from "express";
import { OpenAI } from "openai";
import { getTemplateForJurisdiction } from "../../lib/templates";
import { getJurisdictionGenerationGuardrail, normalizeJurisdictionId } from "../../lib/jurisdictions";
import { generateDocxBuffer, sanitizeFilename } from "../../lib/docx-utils";
import { createLegalCitation, getApprovedLegalReferencesForTemplate, recordUsageEvent, saveGeneratedDocument } from "../db";
import { sdk } from "../_core/sdk";
import type { User } from "../../drizzle/schema";

const router = Router();

interface GenerateDocRequest {
  templateId: string;
  jurisdictionId?: string;
  formData: Record<string, string | number | boolean>;
}

function getLegalContext(references: Awaited<ReturnType<typeof getApprovedLegalReferencesForTemplate>>) {
  if (!references.length) {
    return "\n\nCORPUS VERIFICADO: No existe aún una fuente oficial aprobada para esta materia en el corpus de LegalDoc. No inventes ni afirmes artículos, números de norma, vigencias o precedentes. Si una referencia normativa es indispensable, marca dentro del borrador: [REFERENCIA NORMATIVA PENDIENTE DE VERIFICACIÓN PROFESIONAL].";
  }

  return `\n\nCORPUS JURÍDICO APROBADO: Usa exclusivamente las referencias siguientes cuando cites normas. No inventes artículos ni cites texto que no aparezca en estas fuentes. Si los datos no bastan, utiliza [REFERENCIA NORMATIVA PENDIENTE DE VERIFICACIÓN PROFESIONAL].\n\n${references.map((reference) => `FUENTE: ${reference.instrumentTitle}${reference.normIdentifier ? ` (${reference.normIdentifier})` : ""}\nVERSIÓN: ${reference.versionLabel} · corte ${reference.versionAsOf.toISOString().slice(0, 10)}\nURL OFICIAL: ${reference.sourceUrl}\nTEXTO DISPONIBLE:\n${reference.contentMarkdown.slice(0, 7000)}`).join("\n\n---\n\n")}`;
}

router.post("/generate-doc", async (req: Request, res: Response) => {
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

    const { templateId, formData } = req.body as GenerateDocRequest;
    const jurisdictionId = normalizeJurisdictionId((req.body as GenerateDocRequest).jurisdictionId);

    let jurisdictionPrompt: string;
    try {
      jurisdictionPrompt = getJurisdictionGenerationGuardrail(jurisdictionId);
    } catch {
      return res.status(400).json({ error: "La jurisdicción seleccionada todavía no está habilitada" });
    }

    const template = getTemplateForJurisdiction(templateId, jurisdictionId);
    if (!template) {
      return res.status(400).json({ error: "La plantilla no pertenece a la jurisdicción seleccionada" });
    }

    // Validate form data
    if (!formData || typeof formData !== "object") {
      return res.status(400).json({ error: "Invalid form data" });
    }

    const approvedReferences = await getApprovedLegalReferencesForTemplate(jurisdictionId, template.id);
    const legalContext = getLegalContext(approvedReferences);

    // Initialize OpenAI client
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not configured");
      return res.status(500).json({ error: "AI service not configured" });
    }

    const openai = new OpenAI({ apiKey });

    // Build the prompt
    const formDataString = Object.entries(formData)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    const userPrompt = `Datos del formulario:\n${formDataString}`;

    // Call OpenAI API
    let generatedContent: string;
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `${jurisdictionPrompt}\n\n${template.systemPrompt}${legalContext}`,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const firstChoice = response.choices[0];
      if (!firstChoice || !firstChoice.message || !firstChoice.message.content) {
        throw new Error("No content generated from OpenAI");
      }

      generatedContent = firstChoice.message.content;
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      return res.status(500).json({
        error: "Error generating document content",
        details: openaiError instanceof Error ? openaiError.message : "Unknown error",
      });
    }

    // Generate DOCX file
    let docxBuffer: Buffer;
    try {
      docxBuffer = await generateDocxBuffer({
        title: template.title,
        content: generatedContent,
        citations: approvedReferences.map((reference) => ({
          label: `${reference.instrumentTitle} · ${reference.versionLabel}`,
          sourceUrl: reference.sourceUrl,
          versionAsOf: reference.versionAsOf.toISOString().slice(0, 10),
        })),
      });
    } catch (docxError) {
      console.error("DOCX generation error:", docxError);
      return res.status(500).json({ error: "Error generating Word document" });
    }

    // Save to database
    try {
      const saved = await saveGeneratedDocument({
        userId: user.id,
        jurisdictionId,
        templateId: template.id,
        templateName: template.title,
        formData: JSON.stringify(formData),
        generatedContent,
        documentTitle: `${template.title} - ${new Date().toLocaleDateString("es-PE")}`,
      });
      const documentId = Number((saved as { insertId?: number }).insertId ?? 0);
      if (documentId) {
        await Promise.all(approvedReferences.map((reference) => createLegalCitation({
          generatedDocumentId: documentId,
          instrumentVersionId: reference.versionId,
          citationLabel: `${reference.instrumentTitle} · ${reference.versionLabel}`,
          sourceUrl: reference.sourceUrl,
        })));
      }
      await recordUsageEvent({ userId: user.id, jurisdictionId, templateId: template.id, eventType: "document_generated" });
      (req as Request & { generatedDocumentId?: number }).generatedDocumentId = documentId;
    } catch (dbError) {
      console.error("Database save error:", dbError);
      // Don't fail the request if we can't save to DB, but log it
    }

    // Send the file with content preview in header
    const filename = sanitizeFilename(`${template.title}.docx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", docxBuffer.length);
    const documentId = (req as Request & { generatedDocumentId?: number }).generatedDocumentId;
    if (documentId) res.setHeader("X-Document-Id", String(documentId));
    res.setHeader("X-Jurisdiction-Id", jurisdictionId);
    res.setHeader("X-Generated-Content", Buffer.from(generatedContent).toString("base64"));
    res.setHeader("X-Legal-Citations", Buffer.from(JSON.stringify(approvedReferences.map((reference) => ({ instrumentVersionId: reference.versionId, label: `${reference.instrumentTitle} · ${reference.versionLabel}`, sourceUrl: reference.sourceUrl, versionAsOf: reference.versionAsOf.toISOString().slice(0, 10) })))).toString("base64"));
    res.send(docxBuffer);
  } catch (error) {
    console.error("Generate doc error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
