import { describe, expect, it } from "vitest";
import { selectCurrentApprovedVersions } from "./db";

describe("selección de versiones del corpus", () => {
  it("conserva exclusivamente la versión aprobada más reciente de cada instrumento", () => {
    const selected = selectCurrentApprovedVersions([
      { id: 1, instrumentId: 10, versionAsOf: new Date("2025-01-01T00:00:00.000Z"), reviewedAt: new Date("2025-01-02T00:00:00.000Z") },
      { id: 2, instrumentId: 10, versionAsOf: new Date("2026-01-01T00:00:00.000Z"), reviewedAt: new Date("2026-01-02T00:00:00.000Z") },
      { id: 3, instrumentId: 20, versionAsOf: new Date("2025-12-01T00:00:00.000Z"), reviewedAt: null },
    ]);

    expect(selected.map((version) => version.id).sort((a, b) => a - b)).toEqual([2, 3]);
  });

  it("resuelve la misma fecha a favor de la revisión posterior y finalmente del identificador mayor", () => {
    const selected = selectCurrentApprovedVersions([
      { id: 7, instrumentId: 10, versionAsOf: new Date("2026-01-01T00:00:00.000Z"), reviewedAt: new Date("2026-01-02T00:00:00.000Z") },
      { id: 8, instrumentId: 10, versionAsOf: new Date("2026-01-01T00:00:00.000Z"), reviewedAt: new Date("2026-01-03T00:00:00.000Z") },
      { id: 9, instrumentId: 11, versionAsOf: new Date("2026-01-01T00:00:00.000Z"), reviewedAt: null },
      { id: 10, instrumentId: 11, versionAsOf: new Date("2026-01-01T00:00:00.000Z"), reviewedAt: null },
    ]);

    expect(selected.map((version) => version.id).sort((a, b) => a - b)).toEqual([8, 10]);
  });
});
