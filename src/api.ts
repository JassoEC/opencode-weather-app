import type { City, Unit } from "./config.ts";

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

interface GeocodeResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

interface GeocodeResponse {
  results?: GeocodeResult[];
}

interface ForecastResponse {
  current?: {
    temperature_2m?: number;
  };
  current_units?: {
    temperature_2m?: string;
  };
}

export interface DailyForecast {
  date: string;
  min: number;
  max: number;
  code: number;
}

interface DailyResponse {
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    weather_code?: number[];
  };
}

export async function geocode(query: string): Promise<City> {
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=1&language=es&format=json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error de geocodificación (${res.status})`);
  }
  const data = (await res.json()) as GeocodeResponse;
  const first = data.results?.[0];
  if (!first) {
    throw new Error(`No se encontró la ciudad "${query}"`);
  }
  return {
    name: first.name,
    latitude: first.latitude,
    longitude: first.longitude,
    country: first.country ?? "",
    admin1: first.admin1 ?? "",
  };
}

export async function fetchTemperature(
  city: City,
  unit: Unit,
): Promise<{ temperature: number; unit: string }> {
  const url =
    `${FORECAST_URL}?latitude=${city.latitude}&longitude=${city.longitude}` +
    `&current=temperature_2m&temperature_unit=${unit}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error al consultar el clima (${res.status})`);
  }
  const data = (await res.json()) as ForecastResponse;
  const temperature = data.current?.temperature_2m;
  if (typeof temperature !== "number") {
    throw new Error("El clima no incluye temperatura actual");
  }
  return {
    temperature,
    unit: data.current_units?.temperature_2m ?? (unit === "celsius" ? "°C" : "°F"),
  };
}

export async function fetchDaily(
  city: City,
  unit: Unit,
  days = 7,
): Promise<DailyForecast[]> {
  const url =
    `${FORECAST_URL}?latitude=${city.latitude}&longitude=${city.longitude}` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
    `&forecast_days=${days}&temperature_unit=${unit}&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error al consultar el pronóstico (${res.status})`);
  }
  const data = (await res.json()) as DailyResponse;
  const { time, temperature_2m_max, temperature_2m_min, weather_code } =
    data.daily ?? {};
  if (!time || !temperature_2m_max || !temperature_2m_min) {
    throw new Error("El pronóstico no incluye datos diarios");
  }
  return time.map((date, i) => ({
    date,
    min: temperature_2m_min[i] ?? NaN,
    max: temperature_2m_max[i] ?? NaN,
    code: weather_code?.[i] ?? -1,
  }));
}
