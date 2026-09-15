import { existsSync, renameSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { City, Unit } from "../types/City.ts";

const CONFIG_DIR = join(homedir(), ".config", "weather-cli");
const OLD_CONFIG_FILE = join(CONFIG_DIR, "config.json");
const CITIES_FILE = join(CONFIG_DIR, "cities.json");
const SETTINGS_FILE = join(CONFIG_DIR, "settings.json");

interface OldConfig {
  unit?: unknown;
  defaultCity?: unknown;
  cities?: unknown;
}

function isValidOldConfig(v: unknown): v is OldConfig {
  return typeof v === "object" && v !== null;
}

export function migrateIfNeeded(): void {
  if (!existsSync(OLD_CONFIG_FILE)) return;
  if (existsSync(CITIES_FILE) || existsSync(SETTINGS_FILE)) return;

  mkdirSync(CONFIG_DIR, { recursive: true });
  try {
    const parsed: unknown = JSON.parse(readFileSync(OLD_CONFIG_FILE, "utf-8"));
    if (!isValidOldConfig(parsed)) return;

    const cities: City[] = Array.isArray(parsed.cities)
      ? (parsed.cities as unknown[]).filter(
          (c): c is City =>
            typeof c === "object" &&
            c !== null &&
            typeof (c as City).name === "string" &&
            typeof (c as City).latitude === "number" &&
            typeof (c as City).longitude === "number",
        )
      : [];

    const unit: Unit =
      parsed.unit === "celsius" || parsed.unit === "fahrenheit"
        ? parsed.unit
        : "celsius";

    const defaultCity: string | null =
      parsed.defaultCity === null || typeof parsed.defaultCity === "string"
        ? parsed.defaultCity
        : null;

    writeFileSync(CITIES_FILE, `${JSON.stringify(cities, null, 2)}\n`, "utf-8");
    writeFileSync(
      SETTINGS_FILE,
      `${JSON.stringify({ unit, defaultCity }, null, 2)}\n`,
      "utf-8",
    );

    renameSync(OLD_CONFIG_FILE, `${OLD_CONFIG_FILE}.bak`);
  } catch {
    // si falla la migración, no bloquear la app
  }
}
