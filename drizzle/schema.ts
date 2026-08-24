import { boolean, date, int, longtext, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Documentos legales generados por los usuarios.
 * Almacena el historial de documentos creados con IA.
 */
export const generatedDocuments = mysqlTable("generated_documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  matterId: int("matterId"),
  jurisdictionId: varchar("jurisdictionId", { length: 32 }).default("pe").notNull(),
  templateId: varchar("templateId", { length: 64 }).notNull(),
  
  templateName: varchar("templateName", { length: 255 }).notNull(),
  formData: text("formData").notNull(), // JSON stringified
  generatedContent: text("generatedContent").notNull(), // El contenido legal generado por IA
  documentTitle: varchar("documentTitle", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GeneratedDocument = typeof generatedDocuments.$inferSelect;
export type InsertGeneratedDocument = typeof generatedDocuments.$inferInsert;

/** Espacio de trabajo privado que organiza el encargo jurídico antes y después de cada documento. */
export const legalMatters = mysqlTable("legal_matters", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull(),
  jurisdictionId: varchar("jurisdictionId", { length: 32 }).default("pe").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  referenceCode: varchar("referenceCode", { length: 64 }),
  matterType: varchar("matterType", { length: 128 }),
  clientName: varchar("clientName", { length: 255 }),
  clientEmail: varchar("clientEmail", { length: 320 }),
  clientPhone: varchar("clientPhone", { length: 64 }),
  description: text("description"),
  facts: longtext("facts"),
  objective: text("objective"),
  nextAction: varchar("nextAction", { length: 512 }),
  status: mysqlEnum("status", ["intake", "active", "waiting_client", "on_hold", "closed"]).default("intake").notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  openedAt: timestamp("openedAt").defaultNow().notNull(),
  closedAt: timestamp("closedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LegalMatter = typeof legalMatters.$inferSelect;
export type InsertLegalMatter = typeof legalMatters.$inferInsert;

/** Integrantes con acceso a un asunto. El propietario conserva siempre el gobierno del espacio. */
export const matterAssignments = mysqlTable("matter_assignments", {
  id: int("id").autoincrement().primaryKey(),
  matterId: int("matterId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "editor", "viewer"]).default("editor").notNull(),
  assignedByUserId: int("assignedByUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("matter_assignments_matter_user_unique").on(table.matterId, table.userId)]);

export type MatterAssignment = typeof matterAssignments.$inferSelect;
export type InsertMatterAssignment = typeof matterAssignments.$inferInsert;

/** Partes relacionadas con un asunto; la clasificación es descriptiva y no sustituye la calificación profesional. */
export const matterParties = mysqlTable("matter_parties", {
  id: int("id").autoincrement().primaryKey(),
  matterId: int("matterId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 128 }).notNull(),
  documentType: varchar("documentType", { length: 64 }),
  documentNumber: varchar("documentNumber", { length: 64 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 64 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MatterParty = typeof matterParties.$inferSelect;
export type InsertMatterParty = typeof matterParties.$inferInsert;

/** Tareas privadas y operativas; los plazos procesales se modelarán posteriormente con sus fuentes y reglas. */
export const matterTasks = mysqlTable("matter_tasks", {
  id: int("id").autoincrement().primaryKey(),
  matterId: int("matterId").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  dueAt: timestamp("dueAt"),
  status: mysqlEnum("status", ["open", "in_progress", "done", "cancelled"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MatterTask = typeof matterTasks.$inferSelect;
export type InsertMatterTask = typeof matterTasks.$inferInsert;

/** Línea de tiempo auditable de acciones y notas del asunto. */
export const matterTimelineEvents = mysqlTable("matter_timeline_events", {
  id: int("id").autoincrement().primaryKey(),
  matterId: int("matterId").notNull(),
  createdByUserId: int("createdByUserId"),
  eventType: mysqlEnum("eventType", ["note", "task_created", "task_completed", "document_linked", "matter_created"]).notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  content: text("content"),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MatterTimelineEvent = typeof matterTimelineEvents.$inferSelect;
export type InsertMatterTimelineEvent = typeof matterTimelineEvents.$inferInsert;

/** Ficha procesal opcional: se completa y confirma por el profesional responsable. */
export const matterProceduralProfiles = mysqlTable("matter_procedural_profiles", {
  id: int("id").autoincrement().primaryKey(),
  matterId: int("matterId").notNull().unique(),
  caseNumber: varchar("caseNumber", { length: 128 }),
  authority: varchar("authority", { length: 255 }),
  venue: varchar("venue", { length: 255 }),
  procedureType: varchar("procedureType", { length: 128 }),
  proceduralStage: varchar("proceduralStage", { length: 128 }),
  sourceReference: varchar("sourceReference", { length: 512 }),
  sourceUrl: varchar("sourceUrl", { length: 2048 }),
  verificationStatus: mysqlEnum("verificationStatus", ["pending_confirmation", "confirmed", "superseded"]).default("pending_confirmation").notNull(),
  lastVerifiedAt: timestamp("lastVerifiedAt"),
  updatedByUserId: int("updatedByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MatterProceduralProfile = typeof matterProceduralProfiles.$inferSelect;
export type InsertMatterProceduralProfile = typeof matterProceduralProfiles.$inferInsert;

/** Hito procesal trazable. Toda fecha conserva su origen y no se presume como notificación válida. */
export const matterProceduralEvents = mysqlTable("matter_procedural_events", {
  id: int("id").autoincrement().primaryKey(),
  matterId: int("matterId").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  eventType: mysqlEnum("eventType", ["filing", "hearing", "deadline", "notification", "status_update", "other"]).notNull(),
  eventAt: timestamp("eventAt").notNull(),
  isDeadline: boolean("isDeadline").default(false).notNull(),
  sourceType: mysqlEnum("sourceType", ["manual", "official_notification", "party_communication", "other"]).default("manual").notNull(),
  sourceReference: varchar("sourceReference", { length: 512 }),
  sourceUrl: varchar("sourceUrl", { length: 2048 }),
  verificationStatus: mysqlEnum("verificationStatus", ["pending_confirmation", "confirmed", "superseded"]).default("pending_confirmation").notNull(),
  notes: text("notes"),
  createdByUserId: int("createdByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MatterProceduralEvent = typeof matterProceduralEvents.$inferSelect;
export type InsertMatterProceduralEvent = typeof matterProceduralEvents.$inferInsert;

/** Resultado del corpus aprobado que un equipo decide conservar dentro de un Asunto. */
export const matterLegalResearch = mysqlTable("matter_legal_research", {
  id: int("id").autoincrement().primaryKey(),
  matterId: int("matterId").notNull(),
  instrumentVersionId: int("instrumentVersionId").notNull(),
  citationLabel: varchar("citationLabel", { length: 512 }).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 2048 }).notNull(),
  articleReference: varchar("articleReference", { length: 255 }),
  note: text("note"),
  addedByUserId: int("addedByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("matter_legal_research_matter_version_unique").on(table.matterId, table.instrumentVersionId)]);

export type MatterLegalResearch = typeof matterLegalResearch.$inferSelect;
export type InsertMatterLegalResearch = typeof matterLegalResearch.$inferInsert;

/** Métricas agregadas de uso para orientar la evolución del producto. */
export const usageEvents = mysqlTable("usage_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  jurisdictionId: varchar("jurisdictionId", { length: 32 }).default("pe").notNull(),
  templateId: varchar("templateId", { length: 64 }),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UsageEvent = typeof usageEvents.$inferSelect;
export type InsertUsageEvent = typeof usageEvents.$inferInsert;

/** Fuentes permitidas para el corpus jurídico. Solo las fuentes aprobadas pueden aportar versiones activas. */
export const legalSources = mysqlTable("legal_sources", {
  id: int("id").autoincrement().primaryKey(),
  jurisdictionId: varchar("jurisdictionId", { length: 32 }).default("pe").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  authority: varchar("authority", { length: 255 }).notNull(),
  sourceType: mysqlEnum("sourceType", ["official_publication", "official_consolidated", "official_archive", "validated_upload"]).notNull(),
  baseUrl: varchar("baseUrl", { length: 1024 }).notNull(),
  updateMethod: mysqlEnum("updateMethod", ["manual", "public_page_check", "authorized_api"]).default("manual").notNull(),
  isOfficial: boolean("isOfficial").default(true).notNull(),
  isEnabled: boolean("isEnabled").default(true).notNull(),
  lastCheckedAt: timestamp("lastCheckedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LegalSource = typeof legalSources.$inferSelect;
export type InsertLegalSource = typeof legalSources.$inferInsert;

/** Norma o cuerpo legal identificado, separado de sus distintas versiones y publicaciones. */
export const legalInstruments = mysqlTable("legal_instruments", {
  id: int("id").autoincrement().primaryKey(),
  jurisdictionId: varchar("jurisdictionId", { length: 32 }).default("pe").notNull(),
  sourceId: int("sourceId").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  normIdentifier: varchar("normIdentifier", { length: 255 }),
  documentType: varchar("documentType", { length: 128 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LegalInstrument = typeof legalInstruments.$inferSelect;
export type InsertLegalInstrument = typeof legalInstruments.$inferInsert;

/** Versiones inmutables de textos legales, con archivo original y Markdown apto para búsqueda y citación. */
export const legalInstrumentVersions = mysqlTable("legal_instrument_versions", {
  id: int("id").autoincrement().primaryKey(),
  instrumentId: int("instrumentId").notNull(),
  versionLabel: varchar("versionLabel", { length: 255 }).notNull(),
  officialPublicationDate: date("officialPublicationDate"),
  versionAsOf: date("versionAsOf").notNull(),
  legalStatus: mysqlEnum("legalStatus", ["vigente", "modificado", "derogado_parcial", "derogado", "pendiente_verificacion"]).default("pendiente_verificacion").notNull(),
  approvalStatus: mysqlEnum("approvalStatus", ["draft", "pending_review", "approved", "rejected", "superseded"]).default("draft").notNull(),
  sourceUrl: varchar("sourceUrl", { length: 2048 }).notNull(),
  sourceFileKey: varchar("sourceFileKey", { length: 512 }),
  contentMarkdown: longtext("contentMarkdown").notNull(),
  checksum: varchar("checksum", { length: 128 }).notNull(),
  changeSummary: text("changeSummary"),
  importedByUserId: int("importedByUserId"),
  reviewedByUserId: int("reviewedByUserId"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LegalInstrumentVersion = typeof legalInstrumentVersions.$inferSelect;
export type InsertLegalInstrumentVersion = typeof legalInstrumentVersions.$inferInsert;

/** Referencias que vinculan un documento generado con la versión legal exacta utilizada. */
export const legalCitations = mysqlTable("legal_citations", {
  id: int("id").autoincrement().primaryKey(),
  generatedDocumentId: int("generatedDocumentId"),
  instrumentVersionId: int("instrumentVersionId").notNull(),
  articleReference: varchar("articleReference", { length: 255 }),
  quotedExcerpt: text("quotedExcerpt"),
  citationLabel: varchar("citationLabel", { length: 512 }).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 2048 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LegalCitation = typeof legalCitations.$inferSelect;
export type InsertLegalCitation = typeof legalCitations.$inferInsert;

/** Hallazgos externos pendientes de validación. Jamás se activan de forma automática. */
export const legalChangeCandidates = mysqlTable("legal_change_candidates", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: int("sourceId").notNull(),
  externalIdentifier: varchar("externalIdentifier", { length: 255 }),
  title: varchar("title", { length: 512 }).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 2048 }).notNull(),
  changeType: mysqlEnum("changeType", ["new_publication", "modification", "repeal", "correction", "unknown"]).default("unknown").notNull(),
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  contentHash: varchar("contentHash", { length: 128 }),
  status: mysqlEnum("status", ["pending_review", "approved", "rejected", "ignored"]).default("pending_review").notNull(),
  notes: text("notes"),
  reviewedByUserId: int("reviewedByUserId"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LegalChangeCandidate = typeof legalChangeCandidates.$inferSelect;
export type InsertLegalChangeCandidate = typeof legalChangeCandidates.$inferInsert;
