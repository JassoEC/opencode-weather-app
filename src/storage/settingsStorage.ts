import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Unit } from "../types/City.ts";

const CONFIG_DIR = join(homedir(), ".config", "weather-cli");
const SETTINGS_FILE = join(CONFIG_DIR, "settings.json");

export interface Settings {
  unit: Unit;
  defaultCity: string | null;
}

const DEFAULT_SETTINGS: Settings = {
  unit: "celsius",
  defaultCity: null,
};

export function loadSettings(): Settings {
  if (!existsSync(SETTINGS_FILE)) return structuredClone(DEFAULT_SETTINGS);
  try {
    const parsed: unknown = JSON.parse(readFileSync(SETTINGS_FILE, "utf-8"));
    if (typeof parsed !== "object" || parsed === null)
      return structuredClone(DEFAULT_SETTINGS);
    const v = parsed as Record<string, unknown>;
    const validUnit = v.unit === "celsius" || v.unit === "fahrenheit";
    const validDefault =
      v.defaultCity === null || typeof v.defaultCity === "string";
    if (!validUnit || !validDefault) return structuredClone(DEFAULT_SETTINGS);
    return { unit: v.unit as Unit, defaultCity: v.defaultCity as string | null };
  } catch {
    return structuredClone(DEFAULT_SETTINGS);
  }
}

export function saveSettings(settings: Settings): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(
    SETTINGS_FILE,
    `${JSON.stringify(settings, null, 2)}\n`,
    "utf-8",
  );
}
