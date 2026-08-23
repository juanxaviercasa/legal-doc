import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { getTemplateForJurisdiction, getTemplatesForJurisdiction } from "../lib/templates";
import { getJurisdictionDisplayModel, normalizeJurisdictionId } from "../lib/jurisdictions";

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
});

export type AppRouter = typeof appRouter;
