import { fetchTemperature, geocode } from "./api.ts";
import type { City, Config, Unit } from "./config.ts";

export interface CityWeather extends City {
  temperature: number;
  unit: string;
}

export function unitSymbol(unit: Unit): string {
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

export function findCity(config: Config, name: string): City | undefined {
  return config.cities.find((c) => sameCityName(c.name, name));
}

export async function searchCity(query: string): Promise<City> {
  return geocode(query);
}

export async function weatherFor(city: City, unit: Unit): Promise<CityWeather> {
  const { temperature, unit: symbol } = await fetchTemperature(city, unit);
  return { ...city, temperature, unit: symbol };
}

export async function weatherForAll(
  cities: City[],
  unit: Unit,
): Promise<CityWeather[]> {
  return Promise.all(cities.map((c) => weatherFor(c, unit)));
}
