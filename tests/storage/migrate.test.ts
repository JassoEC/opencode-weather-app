import { describe, expect, it, afterAll } from "bun:test";
import { homedir } from "node:os";
import { join } from "node:path";
import { mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";

const realConfigDir = join(homedir(), ".config", "weather-cli");
const configFile = join(realConfigDir, "config.json");
const citiesFile = join(realConfigDir, "cities.json");
const settingsFile = join(realConfigDir, "settings.json");

let backups: Record<string, string | null> = {};

function backup(name: string, path: string) {
  backups[name] = existsSync(path) ? readFileSync(path, "utf-8") : null;
}

function restoreAll() {
  for (const [path, content] of Object.entries(backups)) {
    if (content !== null) {
      writeFileSync(path, content, "utf-8");
    } else if (existsSync(path)) {
      rmSync(path);
    }
  }
}

const { migrateIfNeeded } = await import("../../src/storage/migrate.ts");

describe("migrateIfNeeded", () => {
  afterAll(() => {
    restoreAll();
  });

  it("does nothing when old config does not exist", () => {
    backup("config", configFile);
    backup("cities", citiesFile);
    backup("settings", settingsFile);
    if (existsSync(configFile)) rmSync(configFile);
    if (existsSync(citiesFile)) rmSync(citiesFile);
    if (existsSync(settingsFile)) rmSync(settingsFile);

    migrateIfNeeded();
    expect(existsSync(citiesFile)).toBe(false);
    expect(existsSync(settingsFile)).toBe(false);
  });

  it("migrates valid old config", () => {
    backup("config2", configFile);
    backup("cities2", citiesFile);
    backup("settings2", settingsFile);
    if (existsSync(citiesFile)) rmSync(citiesFile);
    if (existsSync(settingsFile)) rmSync(settingsFile);

    mkdirSync(realConfigDir, { recursive: true });
    const oldConfig = {
      unit: "fahrenheit",
      defaultCity: "Madrid",
      cities: [
        { name: "Madrid", admin1: "Madrid", country: "España", latitude: 40.4, longitude: -3.7 },
      ],
    };
    writeFileSync(configFile, JSON.stringify(oldConfig), "utf-8");

    migrateIfNeeded();

    expect(existsSync(configFile + ".bak")).toBe(true);
    expect(existsSync(configFile)).toBe(false);
    expect(existsSync(citiesFile)).toBe(true);
    expect(existsSync(settingsFile)).toBe(true);

    const cities = JSON.parse(readFileSync(citiesFile, "utf-8"));
    expect(cities).toHaveLength(1);
    expect(cities[0].name).toBe("Madrid");

    const settings = JSON.parse(readFileSync(settingsFile, "utf-8"));
    expect(settings.unit).toBe("fahrenheit");
    expect(settings.defaultCity).toBe("Madrid");
  });

  it("does nothing when new files already exist", () => {
    backup("config3", configFile);
    backup("cities3", citiesFile);
    backup("settings3", settingsFile);

    mkdirSync(realConfigDir, { recursive: true });
    writeFileSync(configFile, JSON.stringify({ unit: "celsius", defaultCity: null, cities: [] }), "utf-8");
    writeFileSync(citiesFile, "[]", "utf-8");
    writeFileSync(settingsFile, JSON.stringify({ unit: "celsius", defaultCity: null }), "utf-8");

    migrateIfNeeded();
    expect(existsSync(configFile)).toBe(true);
  });

  it("handles invalid JSON in old config gracefully", () => {
    backup("config4", configFile);
    backup("cities4", citiesFile);
    backup("settings4", settingsFile);
    if (existsSync(citiesFile)) rmSync(citiesFile);
    if (existsSync(settingsFile)) rmSync(settingsFile);

    mkdirSync(realConfigDir, { recursive: true });
    writeFileSync(configFile, "{not valid json!!!", "utf-8");

    migrateIfNeeded();
    expect(existsSync(citiesFile)).toBe(false);
    expect(existsSync(settingsFile)).toBe(false);
  });

  it("filters invalid cities during migration", () => {
    backup("config5", configFile);
    backup("cities5", citiesFile);
    backup("settings5", settingsFile);
    if (existsSync(citiesFile)) rmSync(citiesFile);
    if (existsSync(settingsFile)) rmSync(settingsFile);

    mkdirSync(realConfigDir, { recursive: true });
    const oldConfig = {
      unit: "celsius",
      defaultCity: null,
      cities: [
        { name: "Good", admin1: "", country: "", latitude: 1, longitude: 2 },
        { name: 123, admin1: "", country: "", latitude: 1, longitude: 2 },
      ],
    };
    writeFileSync(configFile, JSON.stringify(oldConfig), "utf-8");

    migrateIfNeeded();
    const cities = JSON.parse(readFileSync(citiesFile, "utf-8"));
    expect(cities).toHaveLength(1);
    expect(cities[0].name).toBe("Good");
  });
});
