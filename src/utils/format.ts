import type { City } from "../types/City.ts";
import type { WeatherCondition } from "../types/Weather.ts";
import { CONDITIONS, UNKNOWN } from "./constants.ts";

const ANSI_RE = /\x1b\[[0-9;]*m/g;

export function visibleLength(text: string): number {
  return [...text.replace(ANSI_RE, "")].length;
}

export function pad(text: string, width: number): string {
  const diff = width - visibleLength(text);
  return diff > 0 ? text + " ".repeat(diff) : text;
}

export function unitSymbol(unit: string): string {
  return unit === "celsius" ? "°C" : "°F";
}

export function formatTemperature(value: number): string {
  return value.toFixed(1);
}

export function sameCityName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function cityLabel(city: City): string {
  return [city.name, city.admin1, city.country]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

export function describeWeather(code: number): WeatherCondition {
  return CONDITIONS[code] ?? UNKNOWN;
}

const DATE_FMT = new Intl.DateTimeFormat("es", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  timeZone: "UTC",
});

export function weekdayLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  const date = new Date(Date.UTC(y, m - 1, d));
  return DATE_FMT.format(date).replace(/\./g, "");
}
