export type JurisdictionStatus = "active" | "coming-soon";

export interface Jurisdiction {
  id: string;
  countryCode: string;
  name: string;
  currency: string;
  status: JurisdictionStatus;
  legalDisclaimer: string;
}

export const DEFAULT_JURISDICTION_ID = "pe";
export const PERU_LEGAL_CONTEXT = "Marco legal peruano: Código Civil Peruano, Ley del Notariado y práctica jurídica peruana vigente, según corresponda al documento.";
export const LEGAL_PRODUCT_DISCLAIMER = "LegalDoc es una herramienta de apoyo a la redacción y no sustituye el criterio, revisión ni responsabilidad profesional del abogado.";
export const JURISDICTION_REVIEW_POLICY = "Cada país requiere catálogo, prompts, pruebas y revisión legal local antes de activarse.";

export const jurisdictions: Jurisdiction[] = [
  { id: "pe", countryCode: "PE", name: "Perú", currency: "PEN", status: "active", legalDisclaimer: "Contenido orientado al marco legal peruano. Requiere revisión profesional antes de su uso." },
  { id: "mx", countryCode: "MX", name: "México", currency: "MXN", status: "coming-soon", legalDisclaimer: "México requiere un paquete legal local antes de habilitarse." },
  { id: "co", countryCode: "CO", name: "Colombia", currency: "COP", status: "coming-soon", legalDisclaimer: "Colombia requiere un paquete legal local antes de habilitarse." },
  { id: "cl", countryCode: "CL", name: "Chile", currency: "CLP", status: "coming-soon", legalDisclaimer: "Chile requiere un paquete legal local antes de habilitarse." },
];

export function getJurisdictionById(id: string) { return jurisdictions.find((item) => item.id === id); }
export function normalizeJurisdictionId(value: unknown) { return typeof value === "string" && getJurisdictionById(value) ? value : DEFAULT_JURISDICTION_ID; }
export function isActiveJurisdiction(id: string) { return getJurisdictionById(id)?.status === "active"; }
export function getActiveJurisdictions() { return jurisdictions.filter((item) => item.status === "active"); }
export function getPlannedJurisdictions() { return jurisdictions.filter((item) => item.status === "coming-soon"); }
export function getJurisdictionPromptContext(id = DEFAULT_JURISDICTION_ID) {
  const jurisdiction = getJurisdictionById(normalizeJurisdictionId(id))!;
  return jurisdiction.id === "pe" ? `Jurisdicción obligatoria: Perú. ${PERU_LEGAL_CONTEXT} No mezcles normas, artículos ni terminología de otros países. Si existe incertidumbre, marca el contenido para revisión profesional.` : jurisdiction.legalDisclaimer;
}
export function getJurisdictionOptions() { return jurisdictions.map((item) => ({ ...item, disabled: item.status !== "active", statusLabel: item.status === "active" ? "Disponible" : "Próximamente" })); }
export function getJurisdictionConfig(id = DEFAULT_JURISDICTION_ID) {
  const jurisdiction = getJurisdictionById(normalizeJurisdictionId(id))!;
  return { ...jurisdiction, canGenerate: jurisdiction.status === "active", promptContext: getJurisdictionPromptContext(jurisdiction.id), notice: `${jurisdiction.legalDisclaimer} ${LEGAL_PRODUCT_DISCLAIMER}` };
}
export function getJurisdictionNotice(id = DEFAULT_JURISDICTION_ID) { return getJurisdictionConfig(id).notice; }
export function getJurisdictionVersion(id = DEFAULT_JURISDICTION_ID) { return `${normalizeJurisdictionId(id)}-1.0`; }
export function getJurisdictionAuditMetadata(id = DEFAULT_JURISDICTION_ID, templateId?: string) { return { jurisdictionId: normalizeJurisdictionId(id), templateId: templateId ?? null, promptVersion: getJurisdictionVersion(id) }; }
export function getJurisdictionRoadmap() { return ["Crear catálogo y prompts independientes por país.", "Revisar terminología y normativa con abogados locales.", "Probar generación, edición y descarga.", "Activar el país solo después de superar la revisión local."]; }
export function getJurisdictionExpansionMessage() { return "Perú es la única jurisdicción activa. Otros países se habilitarán individualmente después de incorporar y revisar su paquete legal local."; }
export function getJurisdictionUserNotice() { return `LegalDoc está especializado exclusivamente en Perú en esta versión. ${getJurisdictionExpansionMessage()} ${LEGAL_PRODUCT_DISCLAIMER}`; }
export function getJurisdictionGenerationGuardrail(id = DEFAULT_JURISDICTION_ID) { if (!isActiveJurisdiction(normalizeJurisdictionId(id))) throw new Error("La jurisdicción seleccionada todavía no está habilitada."); return getJurisdictionPromptContext(id); }
export function getJurisdictionRuntimeConfig() { return { defaultJurisdictionId: DEFAULT_JURISDICTION_ID, enabledJurisdictions: ["pe"], plannedJurisdictions: getPlannedJurisdictions().map((item) => item.id) }; }
export function getJurisdictionDisplayModel(id = DEFAULT_JURISDICTION_ID) { return { selectedId: normalizeJurisdictionId(id), options: getJurisdictionOptions(), notice: getJurisdictionNotice(id), expansionMessage: getJurisdictionExpansionMessage() }; }
export function getJurisdictionSelectionMessage(id: string) { return isActiveJurisdiction(id) ? `Generando bajo el marco legal de ${getJurisdictionById(id)!.name}.` : "Esta jurisdicción aún está en preparación y no permite generar documentos."; }
export function getJurisdictionReviewNotice() { return "Revisa siempre el documento generado y adáptalo al caso concreto antes de utilizarlo o presentarlo."; }
export function getJurisdictionCountryLabel(id: string) { const item = getJurisdictionById(id) ?? getJurisdictionById(DEFAULT_JURISDICTION_ID)!; return `${item.name} (${item.countryCode})`; }
export function getJurisdictionCurrency(id = DEFAULT_JURISDICTION_ID) { return getJurisdictionById(normalizeJurisdictionId(id))!.currency; }
export function getJurisdictionCountry(id = DEFAULT_JURISDICTION_ID) { return getJurisdictionById(normalizeJurisdictionId(id))!.name; }
export function getJurisdictionProductCopy() { return "Primero precisión y especialización en Perú; después expansión controlada país por país."; }
