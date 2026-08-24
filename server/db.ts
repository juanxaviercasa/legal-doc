import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createHash } from "node:crypto";
import {
  InsertGeneratedDocument,
  InsertLegalChangeCandidate,
  InsertLegalInstrument,
  InsertLegalSource,
  InsertUser,
  InsertUsageEvent,
  generatedDocuments,
  legalChangeCandidates,
  legalCitations,
  legalInstrumentVersions,
  legalInstruments,
  legalSources,
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
  await db.update(legalInstrumentVersions).set({ approvalStatus: "approved", legalStatus: input.legalStatus, reviewedByUserId: input.reviewerId, reviewedAt: new Date(), changeSummary: input.changeSummary ?? version.changeSummary }).where(eq(legalInstrumentVersions.id, input.versionId));
  await db.update(legalInstruments).set({ status: "active", updatedAt: new Date() }).where(eq(legalInstruments.id, version.instrumentId));
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
