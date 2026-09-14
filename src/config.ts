import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type Unit = "celsius" | "fahrenheit";

export interface City {
  name: string;
  admin1: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface Config {
  unit: Unit;
  defaultCity: string | null;
  cities: City[];
}

const CONFIG_DIR = join(homedir(), ".config", "weather-cli");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

const DEFAULT_CONFIG: Config = {
  unit: "celsius",
  defaultCity: null,
  cities: [],
};

export function configPath(): string {
  return CONFIG_FILE;
}

function isConfig(value: unknown): value is Config {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const validUnit = v.unit === "celsius" || v.unit === "fahrenheit";
  const validDefault =
    v.defaultCity === null || typeof v.defaultCity === "string";
  const validCities =
    Array.isArray(v.cities) &&
    v.cities.every(
      (c) =>
        typeof c === "object" &&
        c !== null &&
        typeof (c as City).name === "string" &&
        typeof (c as City).latitude === "number" &&
        typeof (c as City).longitude === "number",
    );
  return validUnit && validDefault && validCities;
}

export function loadConfig(): Config {
  if (!existsSync(CONFIG_FILE)) {
    saveConfig(DEFAULT_CONFIG);
    return structuredClone(DEFAULT_CONFIG);
  }
  try {
    const parsed: unknown = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
    if (!isConfig(parsed)) return structuredClone(DEFAULT_CONFIG);
    return parsed;
  } catch {
    return structuredClone(DEFAULT_CONFIG);
  }
}

export function saveConfig(config: Config): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(
    CONFIG_FILE,
    `${JSON.stringify(config, null, 2)}\n`,
    "utf-8",
  );
}
