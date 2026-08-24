import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest: vi.fn() } }));
vi.mock("openai", () => ({ OpenAI: vi.fn().mockImplementation(() => ({ chat: { completions: { create: vi.fn().mockResolvedValue({ choices: [{ message: { content: "Contenido generado para pruebas." } }] }) } } })) }));
vi.mock("./db", () => ({
  getDocumentById: vi.fn(),
  recordUsageEvent: vi.fn(),
  saveGeneratedDocument: vi.fn(),
}));
vi.mock("./storage", () => ({ storagePut: vi.fn() }));

import { sdk } from "./_core/sdk";
import * as db from "./db";
import generateDocRouter from "./api/generate-doc";
import downloadDocRouter from "./api/download-doc";
import downloadContentRouter from "./api/download-content";
import legalCorpusUploadRouter from "./api/legal-corpus-upload";
import { storagePut } from "./storage";

const user = { id: 7, openId: "test-user", name: "Test User", email: "test@example.com", loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const app = express();
app.use(express.json());
app.use("/api", generateDocRouter);
app.use("/api", downloadDocRouter);
app.use("/api", downloadContentRouter);
app.use("/api", legalCorpusUploadRouter);

beforeEach(() => {
  vi.mocked(sdk.authenticateRequest).mockReset();
  vi.mocked(db.getDocumentById).mockReset();
  vi.mocked(db.recordUsageEvent).mockReset();
  vi.mocked(db.saveGeneratedDocument).mockReset();
  vi.mocked(storagePut).mockReset();
});

describe("document HTTP routes", () => {
  it("exige autenticación para generar documentos", async () => {
    vi.mocked(sdk.authenticateRequest).mockRejectedValue(new Error("missing session"));
    const response = await request(app).post("/api/generate-doc").send({ templateId: "carta-notarial-deuda", formData: {} });
    expect(response.status).toBe(401);
  });

  it("genera un Word y persiste el evento cuando Perú está activo", async () => {
    vi.mocked(sdk.authenticateRequest).mockResolvedValue(user as any);
    vi.mocked(db.saveGeneratedDocument).mockResolvedValue({ insertId: 42 } as any);
    const response = await request(app).post("/api/generate-doc").send({ templateId: "carta-notarial-deuda", jurisdictionId: "pe", formData: { debtorName: "Persona de prueba" } });
    expect(response.status).toBe(200);
    expect(response.headers["x-document-id"]).toBe("42");
    expect(response.headers["x-jurisdiction-id"]).toBe("pe");
    expect(Number(response.headers["content-length"])).toBeGreaterThan(100);
    expect(db.recordUsageEvent).toHaveBeenCalledWith({ userId: 7, jurisdictionId: "pe", templateId: "carta-notarial-deuda", eventType: "document_generated" });
  });

  it("rechaza una jurisdicción que aún no está habilitada", async () => {
    vi.mocked(sdk.authenticateRequest).mockResolvedValue(user as any);
    const response = await request(app).post("/api/generate-doc").send({ templateId: "carta-notarial-deuda", jurisdictionId: "mx", formData: {} });
    expect(response.status).toBe(400);
    expect(response.body.error).toContain("todavía no está habilitada");
  });

  it("rechaza una plantilla que no pertenece a la jurisdicción", async () => {
    vi.mocked(sdk.authenticateRequest).mockResolvedValue(user as any);
    const response = await request(app).post("/api/generate-doc").send({ templateId: "plantilla-inexistente", jurisdictionId: "pe", formData: {} });
    expect(response.status).toBe(400);
    expect(response.body.error).toContain("no pertenece");
  });

  it("exige autenticación para descargar contenido editado", async () => {
    vi.mocked(sdk.authenticateRequest).mockRejectedValue(new Error("missing session"));
    const response = await request(app).post("/api/download-content").send({ title: "Documento", content: "Contenido" });
    expect(response.status).toBe(401);
  });

  it("valida el identificador antes de consultar una descarga histórica", async () => {
    vi.mocked(sdk.authenticateRequest).mockResolvedValue(user as any);
    const response = await request(app).get("/api/download-doc/no-es-un-id");
    expect(response.status).toBe(400);
    expect(db.getDocumentById).not.toHaveBeenCalled();
  });

  it("descarga un documento histórico y registra la descarga", async () => {
    vi.mocked(sdk.authenticateRequest).mockResolvedValue(user as any);
    vi.mocked(db.getDocumentById).mockResolvedValue({ id: 9, userId: 7, jurisdictionId: "pe", templateId: "carta-notarial-deuda", documentTitle: "Carta histórica", generatedContent: "Contenido histórico." } as any);
    const response = await request(app).get("/api/download-doc/9");
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    expect(db.recordUsageEvent).toHaveBeenCalledWith({ userId: 7, jurisdictionId: "pe", templateId: "carta-notarial-deuda", eventType: "document_downloaded" });
  });

  it("genera un Word desde contenido editado autenticado", async () => {
    vi.mocked(sdk.authenticateRequest).mockResolvedValue(user as any);
    const response = await request(app).post("/api/download-content").send({ title: "Acuerdo editado", content: "PRIMERA CLÁUSULA\nContenido revisado." });
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    expect(Number(response.headers["content-length"])).toBeGreaterThan(100);
  });

  it("exige autenticación para conservar una fuente jurídica original", async () => {
    vi.mocked(sdk.authenticateRequest).mockRejectedValue(new Error("missing session"));
    const response = await request(app).post("/api/legal-corpus/upload").set("Content-Type", "text/markdown").send("# Fuente oficial");
    expect(response.status).toBe(401);
  });

  it("bloquea cargas de corpus realizadas por usuarios sin rol administrador", async () => {
    vi.mocked(sdk.authenticateRequest).mockResolvedValue(user as any);
    const response = await request(app).post("/api/legal-corpus/upload").set("Content-Type", "text/markdown").send("# Fuente oficial");
    expect(response.status).toBe(403);
    expect(storagePut).not.toHaveBeenCalled();
  });

  it("conserva una fuente oficial cuando la carga realiza un administrador", async () => {
    vi.mocked(sdk.authenticateRequest).mockResolvedValue({ ...user, role: "admin" } as any);
    vi.mocked(storagePut).mockResolvedValue({ key: "legal-corpus/pe/7/codigo-civil.md", url: "/manus-storage/legal-corpus/pe/7/codigo-civil.md" });
    const response = await request(app)
      .post("/api/legal-corpus/upload")
      .set("Content-Type", "text/markdown")
      .set("X-File-Name", encodeURIComponent("Código Civil.md"))
      .send("# Código Civil\n\nTexto oficial validado.");
    expect(response.status).toBe(201);
    expect(response.body.key).toContain("legal-corpus/pe/7");
    expect(storagePut).toHaveBeenCalledWith(expect.stringContaining("Codigo-Civil.md"), expect.any(Buffer), "text/markdown");
  });
});
