import { eq, desc, and, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createHash } from "node:crypto";
import {
  InsertGeneratedDocument,
  InsertLegalChangeCandidate,
  InsertLegalInstrument,
  InsertLegalSource,
  InsertLegalMatter,
  InsertMatterParty,
  InsertMatterProceduralEvent,
  InsertMatterProceduralProfile,
  InsertMatterTask,
  InsertMatterTimelineEvent,
  InsertUser,
  InsertUsageEvent,
  generatedDocuments,
  legalChangeCandidates,
  legalCitations,
  legalInstrumentVersions,
  legalInstruments,
  legalMatters,
  legalSources,
  matterAssignments,
  matterParties,
  matterProceduralEvents,
  matterProceduralProfiles,
  matterTasks,
  matterTimelineEvents,
  usageEvents,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Document generation helpers
export async function saveGeneratedDocument(doc: InsertGeneratedDocument) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(generatedDocuments).values(doc);
  return result;
}

export async function getUserDocuments(userId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const result = await db
    .select()
    .from(generatedDocuments)
    .where(eq(generatedDocuments.userId, userId))
    .orderBy(desc(generatedDocuments.createdAt));

  return result;
}

export async function getDocumentById(documentId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(generatedDocuments)
    .where(and(eq(generatedDocuments.id, documentId), eq(generatedDocuments.userId, userId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateGeneratedDocumentContent(documentId: number, userId: number, generatedContent: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(generatedDocuments)
    .set({ generatedContent, updatedAt: new Date() })
    .where(and(eq(generatedDocuments.id, documentId), eq(generatedDocuments.userId, userId)));

  return getDocumentById(documentId, userId);
}

type MatterUpdate = Partial<Pick<InsertLegalMatter, "title" | "referenceCode" | "matterType" | "clientName" | "clientEmail" | "clientPhone" | "description" | "facts" | "objective" | "nextAction" | "status" | "priority" | "closedAt">>;

export async function getUserMatters(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const [matters, assignments] = await Promise.all([
    db.select().from(legalMatters).orderBy(desc(legalMatters.updatedAt)),
    db.select().from(matterAssignments).where(eq(matterAssignments.userId, userId)),
  ]);
  const assignedMatterIds = new Set(assignments.map((assignment) => assignment.matterId));
  return matters.filter((matter) => matter.ownerUserId === userId || assignedMatterIds.has(matter.id));
}

export async function getMatterAccess(matterId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const matter = (await db.select().from(legalMatters).where(eq(legalMatters.id, matterId)).limit(1))[0];
  if (!matter) return undefined;
  if (matter.ownerUserId === userId) return { matter, role: "owner" as const };
  const assignment = (await db.select().from(matterAssignments).where(and(eq(matterAssignments.matterId, matterId), eq(matterAssignments.userId, userId))).limit(1))[0];
  return assignment ? { matter, role: assignment.role } : undefined;
}

export async function getMatterById(matterId: number, userId: number) {
  return (await getMatterAccess(matterId, userId))?.matter;
}

async function ensureMatterEditor(matterId: number, userId: number) {
  const access = await getMatterAccess(matterId, userId);
  if (!access || access.role === "viewer") throw new Error("No tienes permiso para editar este asunto");
  return access;
}

async function ensureMatterOwner(matterId: number, userId: number) {
  const access = await getMatterAccess(matterId, userId);
  if (!access || access.role !== "owner") throw new Error("Solo el propietario puede administrar responsables o archivar este asunto");
  return access;
}

export async function getMatterWorkspace(matterId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const matter = await getMatterById(matterId, userId);
  if (!matter) return undefined;
  const [parties, tasks, timeline, documents, assignments] = await Promise.all([
    db.select().from(matterParties).where(eq(matterParties.matterId, matterId)).orderBy(desc(matterParties.createdAt)),
    db.select().from(matterTasks).where(eq(matterTasks.matterId, matterId)).orderBy(desc(matterTasks.createdAt)),
    db.select().from(matterTimelineEvents).where(eq(matterTimelineEvents.matterId, matterId)).orderBy(desc(matterTimelineEvents.occurredAt)),
    db.select().from(generatedDocuments).where(eq(generatedDocuments.matterId, matterId)).orderBy(desc(generatedDocuments.updatedAt)),
    db.select().from(matterAssignments).where(eq(matterAssignments.matterId, matterId)),
  ]);
  const assigneeIds = Array.from(new Set([matter.ownerUserId, ...assignments.map((assignment) => assignment.userId)]));
  const assigneeResults = await Promise.all(assigneeIds.map((id) => db.select().from(users).where(eq(users.id, id)).limit(1)));
  const assignees = assigneeResults.flatMap((result) => result);
  return { matter, parties, tasks, timeline, documents, assignments, assignees };
}

export async function createMatter(input: Omit<InsertLegalMatter, "id" | "createdAt" | "updatedAt" | "openedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(legalMatters).values(input);
  const matterId = Number(result[0].insertId);
  await db.insert(matterAssignments).values({ matterId, userId: input.ownerUserId, role: "owner", assignedByUserId: input.ownerUserId });
  await db.insert(matterTimelineEvents).values({ matterId, createdByUserId: input.ownerUserId, eventType: "matter_created", title: "Asunto creado" });
  return getMatterById(matterId, input.ownerUserId);
}

export async function updateMatter(matterId: number, userId: number, input: MatterUpdate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await ensureMatterEditor(matterId, userId);
  await db.update(legalMatters).set({ ...input, updatedAt: new Date() }).where(eq(legalMatters.id, matterId));
  return getMatterById(matterId, userId);
}

export async function createMatterParty(input: Omit<InsertMatterParty, "id" | "createdAt" | "updatedAt">, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await ensureMatterEditor(input.matterId, userId);
  const result = await db.insert(matterParties).values(input);
  return Number(result[0].insertId);
}

export async function createMatterTask(input: Omit<InsertMatterTask, "id" | "createdAt" | "updatedAt" | "completedAt">, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await ensureMatterEditor(input.matterId, userId);
  const result = await db.insert(matterTasks).values(input);
  const taskId = Number(result[0].insertId);
  await db.insert(matterTimelineEvents).values({ matterId: input.matterId, createdByUserId: userId, eventType: "task_created", title: `Tarea creada: ${input.title}` });
  return (await db.select().from(matterTasks).where(eq(matterTasks.id, taskId)).limit(1))[0];
}

export async function updateMatterTask(input: { taskId: number; userId: number; status?: "open" | "in_progress" | "done" | "cancelled"; title?: string; description?: string | null; dueAt?: Date | null; priority?: "low" | "normal" | "high" | "urgent" }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const task = (await db.select().from(matterTasks).where(eq(matterTasks.id, input.taskId)).limit(1))[0];
  if (!task) throw new Error("Tarea no encontrada");
  await ensureMatterEditor(task.matterId, input.userId);
  const completedAt = input.status ? (input.status === "done" ? new Date() : null) : undefined;
  const { taskId, userId, ...changes } = input;
  await db.update(matterTasks).set({ ...changes, completedAt, updatedAt: new Date() }).where(eq(matterTasks.id, taskId));
  if (input.status === "done" && task.status !== "done") {
    await db.insert(matterTimelineEvents).values({ matterId: task.matterId, createdByUserId: input.userId, eventType: "task_completed", title: `Tarea completada: ${input.title ?? task.title}` });
  }
  return (await db.select().from(matterTasks).where(eq(matterTasks.id, input.taskId)).limit(1))[0];
}

export async function addMatterNote(input: Omit<InsertMatterTimelineEvent, "id" | "createdAt" | "eventType" | "occurredAt"> & { occurredAt?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!input.createdByUserId) throw new Error("Usuario no identificado");
  await ensureMatterEditor(input.matterId, input.createdByUserId);
  const result = await db.insert(matterTimelineEvents).values({ ...input, eventType: "note", occurredAt: input.occurredAt ?? new Date() });
  return Number(result[0].insertId);
}

export async function linkDocumentToMatter(documentId: number, matterId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const document = await getDocumentById(documentId, userId);
  if (!document) throw new Error("Documento no encontrado");
  await ensureMatterEditor(matterId, userId);
  await db.update(generatedDocuments).set({ matterId, updatedAt: new Date() }).where(and(eq(generatedDocuments.id, documentId), eq(generatedDocuments.userId, userId)));
  await db.insert(matterTimelineEvents).values({ matterId, createdByUserId: userId, eventType: "document_linked", title: `Documento vinculado: ${document.documentTitle}` });
  return getDocumentById(documentId, userId);
}

export async function addMatterAssignee(input: { matterId: number; assigneeEmail: string; role: "editor" | "viewer"; ownerUserId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await ensureMatterOwner(input.matterId, input.ownerUserId);
  const assignee = (await db.select().from(users).where(eq(users.email, input.assigneeEmail)).limit(1))[0];
  if (!assignee) throw new Error("La persona debe haber iniciado sesión en LegalDoc con ese correo antes de poder asignarla");
  if (assignee.id === input.ownerUserId) throw new Error("El propietario ya tiene acceso al asunto");
  await db.insert(matterAssignments).values({ matterId: input.matterId, userId: assignee.id, role: input.role, assignedByUserId: input.ownerUserId }).onDuplicateKeyUpdate({ set: { role: input.role, assignedByUserId: input.ownerUserId } });
  return assignee;
}

export async function removeMatterAssignee(input: { matterId: number; assigneeUserId: number; ownerUserId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const access = await ensureMatterOwner(input.matterId, input.ownerUserId);
  if (access.matter.ownerUserId === input.assigneeUserId) throw new Error("No se puede retirar al propietario del asunto");
  await db.delete(matterAssignments).where(and(eq(matterAssignments.matterId, input.matterId), eq(matterAssignments.userId, input.assigneeUserId)));
  return { success: true };
}

export async function archiveMatter(matterId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await ensureMatterOwner(matterId, userId);
  await db.update(legalMatters).set({ status: "closed", closedAt: new Date(), updatedAt: new Date() }).where(eq(legalMatters.id, matterId));
  await db.insert(matterTimelineEvents).values({ matterId, createdByUserId: userId, eventType: "note", title: "Asunto archivado", content: "El propietario archivó este asunto. El historial se conserva sin eliminación destructiva." });
  return getMatterById(matterId, userId);
}

type ProceduralProfileUpdate = Partial<Pick<InsertMatterProceduralProfile, "caseNumber" | "authority" | "venue" | "procedureType" | "proceduralStage" | "sourceReference" | "sourceUrl" | "verificationStatus" | "lastVerifiedAt" | "updatedByUserId">>;

export async function getMatterProceduralData(matterId: number, userId: number) {
  const db = await getDb();
  if (!db || !(await getMatterAccess(matterId, userId))) return undefined;
  const [profile, events] = await Promise.all([
    db.select().from(matterProceduralProfiles).where(eq(matterProceduralProfiles.matterId, matterId)).limit(1),
    db.select().from(matterProceduralEvents).where(eq(matterProceduralEvents.matterId, matterId)).orderBy(matterProceduralEvents.eventAt),
  ]);
  return { profile: profile[0] ?? null, events };
}

export async function upsertMatterProceduralProfile(matterId: number, userId: number, input: ProceduralProfileUpdate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await ensureMatterEditor(matterId, userId);
  const existing = (await db.select().from(matterProceduralProfiles).where(eq(matterProceduralProfiles.matterId, matterId)).limit(1))[0];
  const values = { ...input, updatedByUserId: userId, lastVerifiedAt: input.verificationStatus === "confirmed" ? new Date() : input.lastVerifiedAt };
  if (existing) {
    await db.update(matterProceduralProfiles).set(values).where(eq(matterProceduralProfiles.matterId, matterId));
  } else {
    await db.insert(matterProceduralProfiles).values({ matterId, ...values, verificationStatus: input.verificationStatus ?? "pending_confirmation" });
  }
  return (await db.select().from(matterProceduralProfiles).where(eq(matterProceduralProfiles.matterId, matterId)).limit(1))[0];
}

export async function createMatterProceduralEvent(input: Omit<InsertMatterProceduralEvent, "id" | "createdAt" | "updatedAt" | "createdByUserId">, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await ensureMatterEditor(input.matterId, userId);
  const result = await db.insert(matterProceduralEvents).values({ ...input, createdByUserId: userId });
  const eventId = Number(result[0].insertId);
  await db.insert(matterTimelineEvents).values({ matterId: input.matterId, createdByUserId: userId, eventType: "note", title: `Evento procesal registrado: ${input.title}`, content: `Fecha declarada: ${input.eventAt.toISOString()}. Estado: ${input.verificationStatus ?? "pending_confirmation"}.` });
  return (await db.select().from(matterProceduralEvents).where(eq(matterProceduralEvents.id, eventId)).limit(1))[0];
}

export async function updateMatterProceduralEvent(input: { eventId: number; userId: number; verificationStatus?: "pending_confirmation" | "confirmed" | "superseded"; title?: string; eventAt?: Date; sourceType?: "manual" | "official_notification" | "party_communication" | "other"; sourceReference?: string | null; sourceUrl?: string | null; notes?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const event = (await db.select().from(matterProceduralEvents).where(eq(matterProceduralEvents.id, input.eventId)).limit(1))[0];
  if (!event) throw new Error("Evento procesal no encontrado");
  await ensureMatterEditor(event.matterId, input.userId);
  const { eventId, userId, ...changes } = input;
  await db.update(matterProceduralEvents).set({ ...changes, updatedAt: new Date() }).where(eq(matterProceduralEvents.id, eventId));
  return (await db.select().from(matterProceduralEvents).where(eq(matterProceduralEvents.id, eventId)).limit(1))[0];
}

export async function getUpcomingProceduralEvents(userId: number, days = 14) {
  const db = await getDb();
  if (!db) return [];
  const matters = await getUserMatters(userId);
  const matterMap = new Map(matters.map((matter) => [matter.id, matter]));
  const events = await db.select().from(matterProceduralEvents).orderBy(matterProceduralEvents.eventAt);
  const until = new Date();
  until.setUTCDate(until.getUTCDate() + days);
  return events.filter((event) => event.eventAt >= new Date() && event.eventAt <= until && matterMap.has(event.matterId)).map((event) => ({ ...event, matterTitle: matterMap.get(event.matterId)!.title }));
}

export async function getProceduralCalendarEvents(userId: number, from: Date, to: Date) {
  const db = await getDb();
  if (!db) return [];
  const matters = await getUserMatters(userId);
  const matterMap = new Map(matters.map((matter) => [matter.id, matter]));
  const events = await db.select().from(matterProceduralEvents).orderBy(matterProceduralEvents.eventAt);
  return events.filter((event) => event.eventAt >= from && event.eventAt <= to && matterMap.has(event.matterId)).map((event) => ({ ...event, matterTitle: matterMap.get(event.matterId)!.title }));
}

export async function recordUsageEvent(event: InsertUsageEvent) {
  const db = await getDb();
  if (!db) return;
  await db.insert(usageEvents).values(event);
}

export async function getUserUsageEvents(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(usageEvents).where(eq(usageEvents.userId, userId)).orderBy(desc(usageEvents.createdAt));
}

export async function getUserUsageSummary(userId: number) {
  const [documents, events] = await Promise.all([getUserDocuments(userId), getUserUsageEvents(userId)]);
  const byType = events.reduce<Record<string, number>>((summary, event) => {
    summary[event.eventType] = (summary[event.eventType] ?? 0) + 1;
    return summary;
  }, {});
  const byTemplate = events.reduce<Record<string, number>>((summary, event) => {
    if (event.templateId) summary[event.templateId] = (summary[event.templateId] ?? 0) + 1;
    return summary;
  }, {});
  return {
    documentsGenerated: documents.length,
    downloads: byType.document_downloaded ?? 0,
    edits: byType.document_edited ?? 0,
    regenerations: byType.document_regenerated ?? 0,
    byType,
    byTemplate,
    byJurisdiction: { pe: events.filter((event) => event.jurisdictionId === "pe").length },
  };
}

// Legal corpus helpers
export async function getLegalSources(jurisdictionId = "pe") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(legalSources).where(eq(legalSources.jurisdictionId, jurisdictionId)).orderBy(desc(legalSources.updatedAt));
}

export async function createLegalSource(source: InsertLegalSource) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(legalSources).values(source);
  return result;
}

export async function markLegalSourceChecked(sourceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(legalSources).set({ lastCheckedAt: new Date(), updatedAt: new Date() }).where(eq(legalSources.id, sourceId));
  return (await db.select().from(legalSources).where(eq(legalSources.id, sourceId)).limit(1))[0];
}

export async function getLegalInstruments(jurisdictionId = "pe") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(legalInstruments).where(eq(legalInstruments.jurisdictionId, jurisdictionId)).orderBy(desc(legalInstruments.updatedAt));
}

export async function getLegalInstrumentVersions(instrumentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(legalInstrumentVersions).where(eq(legalInstrumentVersions.instrumentId, instrumentId)).orderBy(desc(legalInstrumentVersions.versionAsOf));
}

export async function getPendingLegalInstrumentVersions(jurisdictionId = "pe") {
  const db = await getDb();
  if (!db) return [];
  const instruments = await db.select().from(legalInstruments).where(eq(legalInstruments.jurisdictionId, jurisdictionId));
  const instrumentMap = new Map(instruments.map((instrument) => [instrument.id, instrument]));
  const versions = await db.select().from(legalInstrumentVersions).where(eq(legalInstrumentVersions.approvalStatus, "pending_review"));
  return versions
    .filter((version) => instrumentMap.has(version.instrumentId))
    .map((version) => ({ ...version, instrumentTitle: instrumentMap.get(version.instrumentId)!.title }));
}

export async function createLegalInstrument(instrument: InsertLegalInstrument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(legalInstruments).values(instrument);
  return result;
}

export async function createLegalInstrumentVersion(input: Omit<typeof legalInstrumentVersions.$inferInsert, "checksum">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const checksum = createHash("sha256").update(input.contentMarkdown).digest("hex");
  const result = await db.insert(legalInstrumentVersions).values({ ...input, checksum });
  return result;
}

export async function approveLegalInstrumentVersion(input: { versionId: number; reviewerId: number; legalStatus: "vigente" | "modificado" | "derogado_parcial" | "derogado" | "pendiente_verificacion"; changeSummary?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const version = (await db.select().from(legalInstrumentVersions).where(eq(legalInstrumentVersions.id, input.versionId)).limit(1))[0];
  if (!version) throw new Error("Versión legal no encontrada");
  await db.update(legalInstrumentVersions).set({ approvalStatus: "superseded" }).where(and(
    eq(legalInstrumentVersions.instrumentId, version.instrumentId),
    eq(legalInstrumentVersions.approvalStatus, "approved"),
    ne(legalInstrumentVersions.id, input.versionId),
  ));
  await db.update(legalInstrumentVersions).set({ approvalStatus: "approved", legalStatus: input.legalStatus, reviewedByUserId: input.reviewerId, reviewedAt: new Date(), changeSummary: input.changeSummary ?? version.changeSummary }).where(eq(legalInstrumentVersions.id, input.versionId));
  await db.update(legalInstruments).set({ status: "active", updatedAt: new Date() }).where(eq(legalInstruments.id, version.instrumentId));
  return (await db.select().from(legalInstrumentVersions).where(eq(legalInstrumentVersions.id, input.versionId)).limit(1))[0];
}

export async function rejectLegalInstrumentVersion(input: { versionId: number; reviewerId: number; reason?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const version = (await db.select().from(legalInstrumentVersions).where(eq(legalInstrumentVersions.id, input.versionId)).limit(1))[0];
  if (!version) throw new Error("Versión legal no encontrada");
  await db.update(legalInstrumentVersions).set({ approvalStatus: "rejected", reviewedByUserId: input.reviewerId, reviewedAt: new Date(), changeSummary: input.reason ?? version.changeSummary }).where(eq(legalInstrumentVersions.id, input.versionId));
  return (await db.select().from(legalInstrumentVersions).where(eq(legalInstrumentVersions.id, input.versionId)).limit(1))[0];
}

export async function getApprovedLegalVersions(jurisdictionId = "pe") {
  const db = await getDb();
  if (!db) return [];
  const instruments = await db.select().from(legalInstruments).where(and(eq(legalInstruments.jurisdictionId, jurisdictionId), eq(legalInstruments.status, "active")));
  const instrumentIds = new Set(instruments.map((instrument) => instrument.id));
  const versions = await db.select().from(legalInstrumentVersions).where(eq(legalInstrumentVersions.approvalStatus, "approved"));
  return versions.filter((version) => instrumentIds.has(version.instrumentId));
}

export type ApprovedLegalReference = {
  instrumentId: number;
  instrumentTitle: string;
  normIdentifier: string | null;
  subject: string | null;
  versionId: number;
  versionLabel: string;
  versionAsOf: Date;
  sourceUrl: string;
  contentMarkdown: string;
};

type VersionWithEffectiveDate = { id: number; instrumentId: number; versionAsOf: Date; reviewedAt: Date | null };

/** Conserva la versión aprobada más reciente por instrumento para datos históricos sin depurar. */
export function selectCurrentApprovedVersions<T extends VersionWithEffectiveDate>(versions: T[]): T[] {
  const currentByInstrument = new Map<number, T>();
  for (const version of versions) {
    const current = currentByInstrument.get(version.instrumentId);
    const isNewer = !current
      || version.versionAsOf.getTime() > current.versionAsOf.getTime()
      || (version.versionAsOf.getTime() === current.versionAsOf.getTime() && (version.reviewedAt?.getTime() ?? 0) > (current.reviewedAt?.getTime() ?? 0))
      || (version.versionAsOf.getTime() === current.versionAsOf.getTime() && (version.reviewedAt?.getTime() ?? 0) === (current.reviewedAt?.getTime() ?? 0) && version.id > current.id);
    if (isNewer) currentByInstrument.set(version.instrumentId, version);
  }
  return Array.from(currentByInstrument.values());
}

const templateSubjects: Record<string, string[]> = {
  "carta-notarial-deuda": ["civil", "notarial"],
  "poder-notarial": ["civil", "notarial"],
  "contrato-prestamo": ["civil"],
  "demanda-civil": ["civil", "procesal civil"],
  "contrato-compraventa": ["civil"],
  "acta-transaccion": ["civil", "notarial"],
  "contrato-trabajo": ["laboral"],
  "acuerdo-confidencialidad": ["civil", "datos personales"],
  "poder-especial-litigar": ["procesal civil", "notarial", "civil"],
};

/**
 * Recupera únicamente versiones aprobadas y vigentes/modificadas que guardan
 * relación expresa con la materia de una plantilla. No completa lagunas con
 * conocimiento no verificado: una lista vacía obliga al modelo a marcar la
 * referencia como pendiente de revisión.
 */
export async function getApprovedLegalReferencesForTemplate(jurisdictionId: string, templateId: string): Promise<ApprovedLegalReference[]> {
  const db = await getDb();
  if (!db) return [];

  const targetSubjects = templateSubjects[templateId] ?? [];
  if (!targetSubjects.length) return [];
  const instruments = await db.select().from(legalInstruments).where(and(eq(legalInstruments.jurisdictionId, jurisdictionId), eq(legalInstruments.status, "active")));
  const relevantInstruments = instruments.filter((instrument) => {
    const searchable = `${instrument.subject ?? ""} ${instrument.documentType} ${instrument.title}`.toLocaleLowerCase("es-PE");
    return targetSubjects.some((subject) => searchable.includes(subject));
  });
  if (!relevantInstruments.length) return [];

  const instrumentMap = new Map(relevantInstruments.map((instrument) => [instrument.id, instrument]));
  const approvedVersions = await db.select().from(legalInstrumentVersions).where(eq(legalInstrumentVersions.approvalStatus, "approved"));
  const currentVersions = selectCurrentApprovedVersions(approvedVersions
    .filter((version) => instrumentMap.has(version.instrumentId) && (version.legalStatus === "vigente" || version.legalStatus === "modificado")));
  return currentVersions.map((version) => {
      const instrument = instrumentMap.get(version.instrumentId)!;
      return {
        instrumentId: instrument.id,
        instrumentTitle: instrument.title,
        normIdentifier: instrument.normIdentifier,
        subject: instrument.subject,
        versionId: version.id,
        versionLabel: version.versionLabel,
        versionAsOf: version.versionAsOf,
        sourceUrl: version.sourceUrl,
        contentMarkdown: version.contentMarkdown,
      };
    });
}

export async function createLegalCitation(input: typeof legalCitations.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(legalCitations).values(input);
}

export async function getDocumentLegalCitations(generatedDocumentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(legalCitations).where(eq(legalCitations.generatedDocumentId, generatedDocumentId)).orderBy(desc(legalCitations.createdAt));
}

export async function getLegalChangeCandidates(sourceId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (sourceId) return db.select().from(legalChangeCandidates).where(eq(legalChangeCandidates.sourceId, sourceId)).orderBy(desc(legalChangeCandidates.detectedAt));
  return db.select().from(legalChangeCandidates).orderBy(desc(legalChangeCandidates.detectedAt));
}

export async function createLegalChangeCandidate(candidate: InsertLegalChangeCandidate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(legalChangeCandidates).values(candidate);
}

export async function reviewLegalChangeCandidate(input: { candidateId: number; reviewerId: number; status: "approved" | "rejected" | "ignored"; notes?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(legalChangeCandidates).set({ status: input.status, reviewedByUserId: input.reviewerId, reviewedAt: new Date(), notes: input.notes ?? null }).where(eq(legalChangeCandidates.id, input.candidateId));
  return (await db.select().from(legalChangeCandidates).where(eq(legalChangeCandidates.id, input.candidateId)).limit(1))[0];
}
