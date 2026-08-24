import { describe, expect, it } from "vitest";
import { historyMoments, referenceSources, studyRoutes } from "../lib/legal-learning";

describe("Biblioteca de la Abogacía", () => {
  it("mantiene enlaces de fuente para cada momento editorial", () => {
    expect(historyMoments).toHaveLength(4);
    expect(historyMoments.every((moment) => moment.sourceUrl.startsWith("https://") && moment.sourceLabel.length > 0)).toBe(true);
  });

  it("identifica el Juicio de Salomón como relato cultural y no como hito histórico", () => {
    const solomon = historyMoments.find((moment) => moment.title.includes("Salomón"));
    expect(solomon?.kind).toBe("cultural");
  });

  it("ofrece rutas prácticas de aprendizaje y fuentes de referencia abiertas", () => {
    expect(studyRoutes.map((route) => route.id)).toEqual(["hechos", "investigacion", "argumento", "etica"]);
    expect(referenceSources).toHaveLength(4);
  });
});
