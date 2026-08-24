export type LegalSourcePolicy = {
  slug: string;
  name: string;
  authority: string;
  baseUrl: string;
  sourceType: "official_publication" | "official_consolidated" | "official_archive" | "validated_upload";
  defaultUpdateMethod: "manual" | "public_page_check" | "authorized_api";
  role: "primary" | "verification" | "user_validated";
  requiresHumanReview: boolean;
  notes: string;
};

/**
 * Catálogo de fuentes permitidas. Las entradas sirven como política de origen;
 * no implican que se consuman automáticamente ni que exista una API pública.
 */
export const PERU_LEGAL_SOURCE_POLICY: LegalSourcePolicy[] = [
  {
    slug: "spij-minjus",
    name: "Sistema Peruano de Información Jurídica (SPIJ)",
    authority: "Ministerio de Justicia y Derechos Humanos",
    baseUrl: "https://spijweb.minjus.gob.pe/",
    sourceType: "official_consolidated",
    defaultUpdateMethod: "manual",
    role: "primary",
    requiresHumanReview: true,
    notes: "Usar únicamente documentos de acceso autorizado y conservar la URL, fecha de consulta y edición oficial.",
  },
  {
    slug: "el-peruano",
    name: "Diario Oficial El Peruano",
    authority: "Editora Perú",
    baseUrl: "https://diariooficial.elperuano.pe/Normas",
    sourceType: "official_publication",
    defaultUpdateMethod: "public_page_check",
    role: "verification",
    requiresHumanReview: true,
    notes: "Las publicaciones detectadas generan candidatos de revisión. No se activa contenido sin validación humana y sin confirmar condiciones de uso.",
  },
  {
    slug: "congreso",
    name: "Archivo Digital de la Legislación del Perú",
    authority: "Congreso de la República del Perú",
    baseUrl: "https://www.leyes.congreso.gob.pe/",
    sourceType: "official_archive",
    defaultUpdateMethod: "manual",
    role: "verification",
    requiresHumanReview: true,
    notes: "Fuente de consulta y archivo; confirmar siempre vigencia y modificatorias antes de aprobar una versión activa.",
  },
  {
    slug: "equipo-validado",
    name: "Documento oficial validado por el equipo jurídico",
    authority: "Equipo jurídico de LegalDoc",
    baseUrl: "https://legal-doc.local/corpus-validado",
    sourceType: "validated_upload",
    defaultUpdateMethod: "manual",
    role: "user_validated",
    requiresHumanReview: true,
    notes: "El archivo original debe provenir de una fuente oficial y contar con metadatos de norma, versión, URL y vigencia.",
  },
];

export const INITIAL_PERU_CORPUS = [
  { title: "Constitución Política del Perú", identifier: "Constitución de 1993", documentType: "Constitución", subject: "Marco constitucional" },
  { title: "Código Civil", identifier: "Decreto Legislativo N.º 295", documentType: "Código", subject: "Civil" },
  { title: "Código Procesal Civil", identifier: "Texto oficial consolidado", documentType: "Código", subject: "Procesal civil" },
  { title: "Ley del Notariado", identifier: "Decreto Legislativo N.º 1049", documentType: "Ley", subject: "Notarial" },
  { title: "Ley de Productividad y Competitividad Laboral", identifier: "Texto Único Ordenado del Decreto Legislativo N.º 728", documentType: "Ley", subject: "Laboral" },
  { title: "Código Penal", identifier: "Decreto Legislativo N.º 635", documentType: "Código", subject: "Penal" },
  { title: "Código Procesal Penal", identifier: "Decreto Legislativo N.º 957", documentType: "Código", subject: "Procesal penal" },
  { title: "Ley de Protección de Datos Personales", identifier: "Ley N.º 29733", documentType: "Ley", subject: "Datos personales" },
];
