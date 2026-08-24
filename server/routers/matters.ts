import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

const matterStatus = z.enum(["intake", "active", "waiting_client", "on_hold", "closed"]);
const taskStatus = z.enum(["open", "in_progress", "done", "cancelled"]);
const priority = z.enum(["low", "normal", "high", "urgent"]);

const matterFields = {
  title: z.string().trim().min(3).max(255),
  referenceCode: z.string().trim().max(64).optional(),
  matterType: z.string().trim().max(128).optional(),
  clientName: z.string().trim().max(255).optional(),
  clientEmail: z.string().trim().email().max(320).optional(),
  clientPhone: z.string().trim().max(64).optional(),
  description: z.string().trim().max(20000).optional(),
  facts: z.string().trim().max(100000).optional(),
  objective: z.string().trim().max(20000).optional(),
  nextAction: z.string().trim().max(512).optional(),
  status: matterStatus.default("intake"),
  priority: priority.default("normal"),
};

export const mattersRouter = router({
  list: protectedProcedure.query(({ ctx }) => db.getUserMatters(ctx.user.id)),
  get: protectedProcedure.input(z.object({ matterId: z.number().int().positive() })).query(({ ctx, input }) => db.getMatterWorkspace(input.matterId, ctx.user.id)),
  create: protectedProcedure.input(z.object(matterFields)).mutation(({ ctx, input }) => db.createMatter({
    ...input,
    ownerUserId: ctx.user.id,
    jurisdictionId: "pe",
    closedAt: input.status === "closed" ? new Date() : null,
  })),
  update: protectedProcedure.input(z.object({
    matterId: z.number().int().positive(),
    title: matterFields.title.optional(),
    referenceCode: matterFields.referenceCode,
    matterType: matterFields.matterType,
    clientName: matterFields.clientName,
    clientEmail: matterFields.clientEmail,
    clientPhone: matterFields.clientPhone,
    description: matterFields.description,
    facts: matterFields.facts,
    objective: matterFields.objective,
    nextAction: matterFields.nextAction,
    status: matterStatus.optional(),
    priority: priority.optional(),
  })).mutation(({ ctx, input }) => {
    const { matterId, status, ...changes } = input;
    return db.updateMatter(matterId, ctx.user.id, {
      ...changes,
      status,
      closedAt: status === "closed" ? new Date() : status ? null : undefined,
    });
  }),
  addParty: protectedProcedure.input(z.object({
    matterId: z.number().int().positive(),
    name: z.string().trim().min(2).max(255),
    role: z.string().trim().min(2).max(128),
    documentType: z.string().trim().max(64).optional(),
    documentNumber: z.string().trim().max(64).optional(),
    email: z.string().trim().email().max(320).optional(),
    phone: z.string().trim().max(64).optional(),
    notes: z.string().trim().max(10000).optional(),
  })).mutation(({ ctx, input }) => db.createMatterParty(input, ctx.user.id)),
  addTask: protectedProcedure.input(z.object({
    matterId: z.number().int().positive(),
    title: z.string().trim().min(2).max(512),
    description: z.string().trim().max(20000).optional(),
    dueAt: z.string().datetime().optional(),
    priority: priority.default("normal"),
  })).mutation(({ ctx, input }) => db.createMatterTask({
    ...input,
    dueAt: input.dueAt ? new Date(input.dueAt) : null,
    status: "open",
  }, ctx.user.id)),
  updateTask: protectedProcedure.input(z.object({
    taskId: z.number().int().positive(),
    title: z.string().trim().min(2).max(512).optional(),
    description: z.string().trim().max(20000).nullable().optional(),
    dueAt: z.string().datetime().nullable().optional(),
    status: taskStatus.optional(),
    priority: priority.optional(),
  })).mutation(({ ctx, input }) => db.updateMatterTask({
    ...input,
    userId: ctx.user.id,
    dueAt: input.dueAt === undefined ? undefined : input.dueAt ? new Date(input.dueAt) : null,
  })),
  addNote: protectedProcedure.input(z.object({
    matterId: z.number().int().positive(),
    title: z.string().trim().min(2).max(512),
    content: z.string().trim().min(1).max(20000),
  })).mutation(({ ctx, input }) => db.addMatterNote({ ...input, createdByUserId: ctx.user.id })),
  addAssignee: protectedProcedure.input(z.object({
    matterId: z.number().int().positive(),
    assigneeEmail: z.string().trim().email().max(320),
    role: z.enum(["editor", "viewer"]),
  })).mutation(({ ctx, input }) => db.addMatterAssignee({ ...input, ownerUserId: ctx.user.id })),
  removeAssignee: protectedProcedure.input(z.object({
    matterId: z.number().int().positive(),
    assigneeUserId: z.number().int().positive(),
  })).mutation(({ ctx, input }) => db.removeMatterAssignee({ ...input, ownerUserId: ctx.user.id })),
  archive: protectedProcedure.input(z.object({ matterId: z.number().int().positive() })).mutation(({ ctx, input }) => db.archiveMatter(input.matterId, ctx.user.id)),
  linkDocument: protectedProcedure.input(z.object({
    matterId: z.number().int().positive(),
    documentId: z.number().int().positive(),
  })).mutation(({ ctx, input }) => db.linkDocumentToMatter(input.documentId, input.matterId, ctx.user.id)),
});
