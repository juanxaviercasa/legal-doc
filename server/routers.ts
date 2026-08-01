import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { templates } from "../lib/templates";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  documents: router({
    getTemplates: publicProcedure.query(() => templates),
    getTemplateById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => {
        return templates.find((t) => t.id === input.id);
      }),
    getHistory: protectedProcedure.query(({ ctx }) =>
      db.getUserDocuments(ctx.user.id)
    ),
    getDocument: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .query(({ ctx, input }) =>
        db.getDocumentById(input.documentId, ctx.user.id)
      ),
  }),
});

export type AppRouter = typeof appRouter;
