import { describe, expect, it } from "vitest";
import { getJurisdictionGenerationGuardrail, getJurisdictionOptions, getJurisdictionById, normalizeJurisdictionId } from "../lib/jurisdictions";
import { getTemplatesForJurisdiction } from "../lib/templates";

describe("jurisdiction boundaries", () => {
  it("mantiene Perú como jurisdicción activa y predeterminada", () => {
    expect(normalizeJurisdictionId(undefined)).toBe("pe");
    expect(getJurisdictionById("pe")?.status).toBe("active");
    expect(getTemplatesForJurisdiction("pe").length).toBeGreaterThan(6);
  });

  it("bloquea países que todavía no tienen paquete legal validado", () => {
    expect(getTemplatesForJurisdiction("mx")).toEqual([]);
    expect(() => getJurisdictionGenerationGuardrail("mx")).toThrow("todavía no está habilitada");
  });

  it("expone países futuros sin habilitarlos para generación", () => {
    const mexico = getJurisdictionOptions().find((option) => option.id === "mx");
    expect(mexico).toMatchObject({ disabled: true, statusLabel: "Próximamente" });
  });

  it("no mezcla el contexto peruano con otros marcos legales", () => {
    const prompt = getJurisdictionGenerationGuardrail("pe");
    expect(prompt).toContain("Jurisdicción obligatoria: Perú");
    expect(prompt).toContain("No mezcles normas");
  });
});
