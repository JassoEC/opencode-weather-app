import { describe, expect, it, afterAll } from "bun:test";
import { homedir } from "node:os";
import { join } from "node:path";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";

const realConfigDir = join(homedir(), ".config", "weather-cli");
const realSettingsFile = join(realConfigDir, "settings.json");

let backupContent: string | null = null;

const { loadSettings, saveSettings } = await import("../../src/storage/settingsStorage.ts");

describe("settingsStorage", () => {
  afterAll(() => {
    if (backupContent !== null) {
      writeFileSync(realSettingsFile, backupContent, "utf-8");
    } else if (existsSync(realSettingsFile)) {
      const { rmSync } = require("node:fs");
      rmSync(realSettingsFile);
    }
  });

  it("returns defaults or loaded settings", () => {
    const result = loadSettings();
    expect(result).toHaveProperty("unit");
    expect(result).toHaveProperty("defaultCity");
  });

  it("round-trips save and load", () => {
    if (existsSync(realSettingsFile)) {
      backupContent = readFileSync(realSettingsFile, "utf-8");
    }

    saveSettings({ unit: "fahrenheit", defaultCity: "Berlin" });
    expect(loadSettings()).toEqual({ unit: "fahrenheit", defaultCity: "Berlin" });
  });

  it("returns defaults on invalid JSON", () => {
    mkdirSync(realConfigDir, { recursive: true });
    writeFileSync(realSettingsFile, "bad json", "utf-8");
    expect(loadSettings()).toEqual({ unit: "celsius", defaultCity: null });
  });

  it("returns defaults on invalid unit value", () => {
    mkdirSync(realConfigDir, { recursive: true });
    writeFileSync(realSettingsFile, JSON.stringify({ unit: "invalid", defaultCity: null }), "utf-8");
    expect(loadSettings()).toEqual({ unit: "celsius", defaultCity: null });
  });

  it("returns defaults on null object", () => {
    mkdirSync(realConfigDir, { recursive: true });
    writeFileSync(realSettingsFile, "null", "utf-8");
    expect(loadSettings()).toEqual({ unit: "celsius", defaultCity: null });
  });
});
