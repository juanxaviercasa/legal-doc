import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { getTemplateForJurisdiction, getTemplatesForJurisdiction } from "../lib/templates";
import { getJurisdictionDisplayModel, normalizeJurisdictionId } from "../lib/jurisdictions";
import { mattersRouter } from "./routers/matters";

const toPublicTemplate = (template: ReturnType<typeof getTemplatesForJurisdiction>[number]) => {
  const { systemPrompt: _systemPrompt, ...publicTemplate } = template;
  return publicTemplate;
};

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  jurisdictions: router({
    list: publicProcedure.query(() => getJurisdictionDisplayModel()),
  }),
  documents: router({
    getTemplates: publicProcedure.input(z.object({ jurisdictionId: z.string().optional() }).optional()).query(({ input }) => {
      return getTemplatesForJurisdiction(normalizeJurisdictionId(input?.jurisdictionId)).map(toPublicTemplate);
    }),
    getTemplateById: publicProcedure.input(z.object({ id: z.string(), jurisdictionId: z.string().optional() })).query(({ input }) => {
      const template = getTemplateForJurisdiction(input.id, normalizeJurisdictionId(input.jurisdictionId));
      return template ? toPublicTemplate(template) : undefined;
    }),
    getHistory: protectedProcedure.query(({ ctx }) => db.getUserDocuments(ctx.user.id)),
    getDocument: protectedProcedure.input(z.object({ documentId: z.number() })).query(({ ctx, input }) => db.getDocumentById(input.documentId, ctx.user.id)),
    updateContent: protectedProcedure.input(z.object({ documentId: z.number(), generatedContent: z.string().trim().min(1).max(200000) })).mutation(async ({ ctx, input }) => {
      const document = await db.getDocumentById(input.documentId, ctx.user.id);
      if (!document) throw new Error("Documento no encontrado");
      const updated = await db.updateGeneratedDocumentContent(input.documentId, ctx.user.id, input.generatedContent);
      await db.recordUsageEvent({ userId: ctx.user.id, jurisdictionId: document.jurisdictionId, templateId: document.templateId, eventType: "document_edited" });
      return updated;
    }),
    analytics: protectedProcedure.query(({ ctx }) => db.getUserUsageSummary(ctx.user.id)),
  }),
  matters: mattersRouter,
  legalCorpus: router({
    approvedVersions: publicProcedure.input(z.object({ jurisdictionId: z.string().default("pe") }).optional()).query(({ input }) => db.getApprovedLegalVersions(input?.jurisdictionId ?? "pe")),
    documentCitations: protectedProcedure.input(z.object({ documentId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const document = await db.getDocumentById(input.documentId, ctx.user.id);
      if (!document) throw new Error("Documento no encontrado");
      return db.getDocumentLegalCitations(input.documentId);
    }),
    adminSources: adminProcedure.input(z.object({ jurisdictionId: z.string().default("pe") }).optional()).query(({ input }) => db.getLegalSources(input?.jurisdictionId ?? "pe")),
    adminInstruments: adminProcedure.input(z.object({ jurisdictionId: z.string().default("pe") }).optional()).query(({ input }) => db.getLegalInstruments(input?.jurisdictionId ?? "pe")),
    adminVersions: adminProcedure.input(z.object({ instrumentId: z.number().int().positive() })).query(({ input }) => db.getLegalInstrumentVersions(input.instrumentId)),
    adminPendingVersions: adminProcedure.input(z.object({ jurisdictionId: z.string().default("pe") }).optional()).query(({ input }) => db.getPendingLegalInstrumentVersions(input?.jurisdictionId ?? "pe")),
    adminCandidates: adminProcedure.input(z.object({ sourceId: z.number().int().positive().optional() }).optional()).query(({ input }) => db.getLegalChangeCandidates(input?.sourceId)),
    createSource: adminProcedure.input(z.object({
      name: z.string().trim().min(3).max(255), authority: z.string().trim().min(3).max(255), baseUrl: z.string().url().max(1024),
      sourceType: z.enum(["official_publication", "official_consolidated", "official_archive", "validated_upload"]), updateMethod: z.enum(["manual", "public_page_check", "authorized_api"]).default("manual"), isOfficial: z.boolean().default(true), isEnabled: z.boolean().default(true),
    })).mutation(({ input }) => db.createLegalSource({ ...input, jurisdictionId: "pe" })),
    markSourceChecked: adminProcedure.input(z.object({ sourceId: z.number().int().positive() })).mutation(({ input }) => db.markLegalSourceChecked(input.sourceId)),
    createInstrument: adminProcedure.input(z.object({ sourceId: z.number().int().positive(), title: z.string().trim().min(3).max(512), normIdentifier: z.string().trim().max(255).optional(), documentType: z.string().trim().min(2).max(128), subject: z.string().trim().max(255).optional(), description: z.string().trim().max(5000).optional() })).mutation(({ input }) => db.createLegalInstrument({ ...input, jurisdictionId: "pe", status: "draft" })),
    createVersion: adminProcedure.input(z.object({ instrumentId: z.number().int().positive(), versionLabel: z.string().trim().min(2).max(255), officialPublicationDate: z.string().date().optional(), versionAsOf: z.string().date(), legalStatus: z.enum(["vigente", "modificado", "derogado_parcial", "derogado", "pendiente_verificacion"]).default("pendiente_verificacion"), sourceUrl: z.string().url().max(2048), sourceFileKey: z.string().max(512).optional(), contentMarkdown: z.string().trim().min(20).max(1500000), changeSummary: z.string().trim().max(20000).optional() })).mutation(({ ctx, input }) => db.createLegalInstrumentVersion({ ...input, officialPublicationDate: input.officialPublicationDate ? new Date(`${input.officialPublicationDate}T00:00:00.000Z`) : undefined, versionAsOf: new Date(`${input.versionAsOf}T00:00:00.000Z`), approvalStatus: "pending_review", importedByUserId: ctx.user.id })),
    approveVersion: adminProcedure.input(z.object({ versionId: z.number().int().positive(), legalStatus: z.enum(["vigente", "modificado", "derogado_parcial", "derogado", "pendiente_verificacion"]), changeSummary: z.string().trim().max(20000).optional() })).mutation(({ ctx, input }) => db.approveLegalInstrumentVersion({ ...input, reviewerId: ctx.user.id })),
    rejectVersion: adminProcedure.input(z.object({ versionId: z.number().int().positive(), reason: z.string().trim().max(20000).optional() })).mutation(({ ctx, input }) => db.rejectLegalInstrumentVersion({ ...input, reviewerId: ctx.user.id })),
    createCandidate: adminProcedure.input(z.object({ sourceId: z.number().int().positive(), externalIdentifier: z.string().trim().max(255).optional(), title: z.string().trim().min(3).max(512), sourceUrl: z.string().url().max(2048), changeType: z.enum(["new_publication", "modification", "repeal", "correction", "unknown"]).default("unknown"), contentHash: z.string().max(128).optional(), notes: z.string().trim().max(20000).optional() })).mutation(({ input }) => db.createLegalChangeCandidate({ ...input, status: "pending_review" })),
    reviewCandidate: adminProcedure.input(z.object({ candidateId: z.number().int().positive(), status: z.enum(["approved", "rejected", "ignored"]), notes: z.string().trim().max(20000).optional() })).mutation(({ ctx, input }) => db.reviewLegalChangeCandidate({ ...input, reviewerId: ctx.user.id })),
  }),
});

export type AppRouter = typeof appRouter;
