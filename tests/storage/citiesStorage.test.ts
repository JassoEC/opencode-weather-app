import { describe, expect, it, afterAll } from "bun:test";
import { homedir } from "node:os";
import { join } from "node:path";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";

const realConfigDir = join(homedir(), ".config", "weather-cli");
const realCitiesFile = join(realConfigDir, "cities.json");

let backupContent: string | null = null;

const { loadCities, saveCities } = await import("../../src/storage/citiesStorage.ts");

describe("citiesStorage", () => {
  afterAll(() => {
    if (backupContent !== null) {
      writeFileSync(realCitiesFile, backupContent, "utf-8");
    } else if (existsSync(realCitiesFile)) {
      rmSync(realCitiesFile);
    }
  });

  it("loads existing cities or empty array", () => {
    const result = loadCities();
    expect(Array.isArray(result)).toBe(true);
  });

  it("round-trips save and load", () => {
    if (existsSync(realCitiesFile)) {
      backupContent = readFileSync(realCitiesFile, "utf-8");
    }

    const cities = [
      { name: "Madrid", admin1: "Madrid", country: "España", latitude: 40.4, longitude: -3.7 },
      { name: "Berlin", admin1: "Land Berlin", country: "Alemania", latitude: 52.5, longitude: 13.4 },
    ];
    saveCities(cities);
    const loaded = loadCities();
    expect(loaded).toHaveLength(2);
    expect(loaded[0].name).toBe("Madrid");
    expect(loaded[1].name).toBe("Berlin");
  });

  it("returns empty array on invalid JSON", () => {
    mkdirSync(realConfigDir, { recursive: true });
    writeFileSync(realCitiesFile, "not json!!", "utf-8");
    expect(loadCities()).toEqual([]);
  });

  it("keeps entries with empty name (passes type check)", () => {
    saveCities([
      { name: "Madrid", admin1: "", country: "", latitude: 40, longitude: -3 },
      { name: "", admin1: "", country: "", latitude: 0, longitude: 0 } as any,
      { name: "X", admin1: "", country: "", latitude: 1, longitude: 2 },
    ]);
    const loaded = loadCities();
    expect(loaded).toHaveLength(3);
    expect(loaded[0].name).toBe("Madrid");
    expect(loaded[1].name).toBe("");
    expect(loaded[2].name).toBe("X");
  });

  it("returns empty array when JSON is not an array", () => {
    mkdirSync(realConfigDir, { recursive: true });
    writeFileSync(realCitiesFile, '{"not":"an array"}', "utf-8");
    expect(loadCities()).toEqual([]);
  });
});
