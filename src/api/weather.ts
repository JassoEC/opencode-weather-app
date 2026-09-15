import type { City, Unit } from "../types/City.ts";
import type { DailyForecast } from "../types/Weather.ts";
import { FORECAST_URL } from "../utils/constants.ts";

interface ForecastResponse {
  current?: {
    temperature_2m?: number;
  };
  current_units?: {
    temperature_2m?: string;
  };
}

interface DailyResponse {
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    weather_code?: number[];
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
