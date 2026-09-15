export interface City {
  name: string;
  admin1: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface AppState {
  cities: City[];
  defaultCity: string | null;
  unit: Unit;
}

export type Unit = "celsius" | "fahrenheit";
