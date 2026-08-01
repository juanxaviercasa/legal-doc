import { Router, Request, Response } from "express";
import { OpenAI } from "openai";
import { getTemplateById } from "../../lib/templates";
import { generateDocxBuffer, sanitizeFilename } from "../../lib/docx-utils";
import { saveGeneratedDocument } from "../db";
import { sdk } from "../_core/sdk";
import type { User } from "../../drizzle/schema";

const router = Router();

interface GenerateDocRequest {
  templateId: string;
  formData: Record<string, string | number | boolean>;
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

    // Validate template exists
    const template = getTemplateById(templateId);
    if (!template) {
      return res.status(400).json({ error: "Template not found" });
    }

    // Validate form data
    if (!formData || typeof formData !== "object") {
      return res.status(400).json({ error: "Invalid form data" });
    }

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
            content: template.systemPrompt,
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
      });
    } catch (docxError) {
      console.error("DOCX generation error:", docxError);
      return res.status(500).json({ error: "Error generating Word document" });
    }

    // Save to database
    try {
      await saveGeneratedDocument({
        userId: user.id,
        templateId: template.id,
        templateName: template.title,
        formData: JSON.stringify(formData),
        generatedContent: generatedContent,
        documentTitle: `${template.title} - ${new Date().toLocaleDateString("es-PE")}`,
      });
    } catch (dbError) {
      console.error("Database save error:", dbError);
      // Don't fail the request if we can't save to DB, but log it
    }

    // Send the file with content preview in header
    const filename = sanitizeFilename(`${template.title}.docx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", docxBuffer.length);
    res.setHeader("X-Generated-Content", Buffer.from(generatedContent).toString("base64"));
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
