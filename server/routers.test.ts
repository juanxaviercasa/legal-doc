import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  getUserDocuments: vi.fn(),
  getDocumentById: vi.fn(),
  updateGeneratedDocumentContent: vi.fn(),
  recordUsageEvent: vi.fn(),
  getUserUsageSummary: vi.fn(),
  getApprovedLegalVersions: vi.fn(),
  getDocumentLegalCitations: vi.fn(),
  getLegalSources: vi.fn(),
  getLegalInstruments: vi.fn(),
  getLegalInstrumentVersions: vi.fn(),
  getPendingLegalInstrumentVersions: vi.fn(),
  getLegalChangeCandidates: vi.fn(),
  createLegalSource: vi.fn(),
  markLegalSourceChecked: vi.fn(),
  createLegalInstrument: vi.fn(),
  createLegalInstrumentVersion: vi.fn(),
  approveLegalInstrumentVersion: vi.fn(),
  rejectLegalInstrumentVersion: vi.fn(),
  createLegalChangeCandidate: vi.fn(),
  reviewLegalChangeCandidate: vi.fn(),
}));

import * as db from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const user = { id: 7, openId: "test-user", name: "Test User", email: "test@example.com", loginMethod: "test", role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const ctx = { user, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] } satisfies TrpcContext;
const adminCtx = { ...ctx, user: { ...user, role: "admin" as const } } satisfies TrpcContext;

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

describe("legalCorpus tRPC procedures", () => {
  it("expone únicamente versiones aprobadas en la consulta pública", async () => {
    const versions = [{ id: 4, instrumentId: 2, approvalStatus: "approved", sourceUrl: "https://fuente-oficial.pe/norma" }];
    vi.mocked(db.getApprovedLegalVersions).mockResolvedValue(versions as any);
    const result = await appRouter.createCaller(ctx).legalCorpus.approvedVersions({ jurisdictionId: "pe" });
    expect(result).toEqual(versions);
    expect(db.getApprovedLegalVersions).toHaveBeenCalledWith("pe");
  });

  it("impide que un usuario regular administre fuentes jurídicas", async () => {
    await expect(appRouter.createCaller(ctx).legalCorpus.adminSources({ jurisdictionId: "pe" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("permite a un administrador registrar una fuente oficial", async () => {
    vi.mocked(db.createLegalSource).mockResolvedValue({ insertId: 3 } as any);
    await appRouter.createCaller(adminCtx).legalCorpus.createSource({ name: "Fuente Oficial", authority: "Entidad Pública", baseUrl: "https://www.gob.pe/", sourceType: "official_archive", updateMethod: "manual", isOfficial: true, isEnabled: true });
    expect(db.createLegalSource).toHaveBeenCalledWith(expect.objectContaining({ jurisdictionId: "pe", name: "Fuente Oficial", isOfficial: true }));
  });

  it("permite registrar la verificación manual de una fuente sin importar texto externo", async () => {
    vi.mocked(db.markLegalSourceChecked).mockResolvedValue({ id: 3, lastCheckedAt: new Date() } as any);
    await appRouter.createCaller(adminCtx).legalCorpus.markSourceChecked({ sourceId: 3 });
    expect(db.markLegalSourceChecked).toHaveBeenCalledWith(3);
  });

  it("permite al revisor aprobar o rechazar una versión pendiente sin activar candidatos automáticamente", async () => {
    vi.mocked(db.approveLegalInstrumentVersion).mockResolvedValue({ id: 11, approvalStatus: "approved" } as any);
    vi.mocked(db.rejectLegalInstrumentVersion).mockResolvedValue({ id: 12, approvalStatus: "rejected" } as any);

    await appRouter.createCaller(adminCtx).legalCorpus.approveVersion({ versionId: 11, legalStatus: "vigente", changeSummary: "Revisión humana completada" });
    await appRouter.createCaller(adminCtx).legalCorpus.rejectVersion({ versionId: 12, reason: "La URL oficial no coincide con el texto cargado" });

    expect(db.approveLegalInstrumentVersion).toHaveBeenCalledWith(expect.objectContaining({ versionId: 11, reviewerId: 7, legalStatus: "vigente" }));
    expect(db.rejectLegalInstrumentVersion).toHaveBeenCalledWith({ versionId: 12, reviewerId: 7, reason: "La URL oficial no coincide con el texto cargado" });
  });
});
