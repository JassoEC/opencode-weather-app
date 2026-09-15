import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { City } from "../types/City.ts";

const CONFIG_DIR = join(homedir(), ".config", "weather-cli");
const CITIES_FILE = join(CONFIG_DIR, "cities.json");

export function loadCities(): City[] {
  if (!existsSync(CITIES_FILE)) return [];
  try {
    const parsed: unknown = JSON.parse(readFileSync(CITIES_FILE, "utf-8"));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c): c is City =>
        typeof c === "object" &&
        c !== null &&
        typeof (c as City).name === "string" &&
        typeof (c as City).latitude === "number" &&
        typeof (c as City).longitude === "number",
    );
  } catch {
    return [];
  }
}

export function saveCities(cities: City[]): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CITIES_FILE, `${JSON.stringify(cities, null, 2)}\n`, "utf-8");
}
