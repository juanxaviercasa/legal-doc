export type HistoryMoment = {
  period: string;
  title: string;
  context: string;
  lesson: string;
  sourceLabel: string;
  sourceUrl: string;
  kind: "historical" | "cultural";
};

export const historyMoments: HistoryMoment[] = [
  {
    period: "Atenas clásica",
    title: "La voz ante la comunidad",
    context: "Los tribunales populares atenienses convirtieron la exposición oral, la organización de los hechos y la persuasión en habilidades decisivas del debate público.",
    lesson: "La elocuencia no sustituye el razonamiento: ordena los hechos para que otra persona pueda examinarlos.",
    sourceLabel: "Athenian Popular Courts: Democracy in Action",
    sourceUrl: "https://learn.academy4sc.org/video/athenian-popular-courts-democracy-in-action/",
    kind: "historical",
  },
  {
    period: "Relato bíblico",
    title: "El juicio atribuido a Salomón",
    context: "1 Reyes 3:16-28 presenta una disputa por la maternidad de un niño y una respuesta que revela el interés de cada parte mediante una hipótesis extrema.",
    lesson: "Escucha antes de decidir. Una pregunta bien planteada puede iluminar intereses que una afirmación no demuestra por sí sola.",
    sourceLabel: "1 Reyes 3:16-28 · USCCB",
    sourceUrl: "https://bible.usccb.org/bible/1kings/3",
    kind: "cultural",
  },
  {
    period: "1215",
    title: "Magna Carta y el límite al poder",
    context: "La carta emitida en junio de 1215 puso por escrito el principio de que el rey y su gobierno no se encuentran por encima de la ley, dentro de un contexto político concreto.",
    lesson: "El Estado de derecho exige límites verificables al poder; los símbolos históricos deben leerse con su contexto, no como eslóganes.",
    sourceLabel: "UK Parliament · Magna Carta",
    sourceUrl: "https://www.parliament.uk/magnacarta/",
    kind: "historical",
  },
  {
    period: "1945–1946",
    title: "Núremberg: documentos, jurisdicción y responsabilidad",
    context: "El Tribunal Militar Internacional de Núremberg se creó bajo el Acuerdo de Londres de 1945 y contribuyó al desarrollo posterior de la justicia penal internacional.",
    lesson: "Las afirmaciones más graves requieren fuentes, expediente, contradicción y trazabilidad documental rigurosa.",
    sourceLabel: "U.S. Department of State · Office of the Historian",
    sourceUrl: "https://history.state.gov/milestones/1945-1952/nuremberg",
    kind: "historical",
  },
];

export const studyRoutes = [
  { id: "hechos", title: "Del relato a los hechos", eyebrow: "Razonamiento", description: "Aprende a separar versión, dato, inferencia y documento antes de escribir una sola conclusión.", modules: ["Cronología verificable", "Preguntas de precisión", "Mapa de contradicciones"], accent: "#1d5b4d" },
  { id: "investigacion", title: "Investigar sin atajos", eyebrow: "Investigación", description: "Construye una rutina de fuentes, vigencia, texto oficial y trazabilidad que resista una revisión exigente.", modules: ["Jerarquía de fuentes", "Vigencia y modificatorias", "Registro de citas"], accent: "#8c6b35" },
  { id: "argumento", title: "Argumentar con estructura", eyebrow: "Estrategia", description: "Conecta pretensión, hechos, norma, prueba y respuesta posible de la contraparte en una secuencia clara.", modules: ["Teoría del caso", "Riesgos y contraargumentos", "Redacción persuasiva"], accent: "#214e72" },
  { id: "etica", title: "El criterio que protege", eyebrow: "Ética", description: "Practica claridad con el cliente, deberes de veracidad y revisión profesional antes de firmar o presentar.", modules: ["Deber de diligencia", "Confidencialidad", "Decisión responsable"], accent: "#735529" },
];

export const referenceSources = [
  { label: "Harvard Law School Library · Nuremberg Trials Project", url: "https://nuremberg.law.harvard.edu/", note: "Archivo abierto de documentos, transcripciones y materiales de los juicios." },
  { label: "U.S. Department of State · Office of the Historian", url: "https://history.state.gov/milestones/1945-1952/nuremberg", note: "Síntesis institucional sobre los tribunales de Núremberg y Tokio." },
  { label: "UK Parliament · Magna Carta", url: "https://www.parliament.uk/magnacarta/", note: "Contexto y límites históricos de Magna Carta." },
  { label: "USCCB · 1 Reyes 3", url: "https://bible.usccb.org/bible/1kings/3", note: "Texto del relato bíblico del Juicio de Salomón." },
];
