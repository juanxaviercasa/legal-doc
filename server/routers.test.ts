import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  getUserDocuments: vi.fn(),
  getDocumentById: vi.fn(),
  updateGeneratedDocumentContent: vi.fn(),
  recordUsageEvent: vi.fn(),
  getUserUsageSummary: vi.fn(),
}));

import * as db from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const user = { id: 7, openId: "test-user", name: "Test User", email: "test@example.com", loginMethod: "test", role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const ctx = { user, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] } satisfies TrpcContext;

beforeEach(() => vi.clearAllMocks());

describe("documents tRPC procedures", () => {
  it("devuelve el historial del usuario autenticado", async () => {
    const history = [{ id: 1, userId: 7, jurisdictionId: "pe", templateId: "contrato-trabajo", templateName: "Contrato de Trabajo" }];
    vi.mocked(db.getUserDocuments).mockResolvedValue(history as any);
    const result = await appRouter.createCaller(ctx).documents.getHistory();
    expect(result).toEqual(history);
    expect(db.getUserDocuments).toHaveBeenCalledWith(7);
  });

  it("persiste la edición y registra el evento en Perú", async () => {
    const original = { id: 1, userId: 7, jurisdictionId: "pe", templateId: "contrato-trabajo" };
    const updated = { ...original, generatedContent: "Contenido revisado" };
    vi.mocked(db.getDocumentById).mockResolvedValue(original as any);
    vi.mocked(db.updateGeneratedDocumentContent).mockResolvedValue(updated as any);
    const result = await appRouter.createCaller(ctx).documents.updateContent({ documentId: 1, generatedContent: "Contenido revisado" });
    expect(result).toEqual(updated);
    expect(db.updateGeneratedDocumentContent).toHaveBeenCalledWith(1, 7, "Contenido revisado");
    expect(db.recordUsageEvent).toHaveBeenCalledWith({ userId: 7, jurisdictionId: "pe", templateId: "contrato-trabajo", eventType: "document_edited" });
  });

  it("expone las métricas sin mezclar jurisdicciones", async () => {
    const summary = { documentsGenerated: 3, downloads: 2, edits: 1, regenerations: 0, byType: { document_downloaded: 2 }, byTemplate: { "contrato-trabajo": 2 }, byJurisdiction: { pe: 3 } };
    vi.mocked(db.getUserUsageSummary).mockResolvedValue(summary);
    const result = await appRouter.createCaller(ctx).documents.analytics();
    expect(result.byJurisdiction).toEqual({ pe: 3 });
    expect(result.documentsGenerated).toBe(3);
  });
});
