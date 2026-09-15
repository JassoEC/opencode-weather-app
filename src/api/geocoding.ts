import type { City } from "../types/City.ts";
import { GEOCODE_URL } from "../utils/constants.ts";

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
