import type { City, Unit } from "./City.ts";

export interface Settings {
  unit: Unit;
  defaultCity: string | null;
  cities: City[];
}

export const DEFAULT_SETTINGS: Settings = {
  unit: "celsius",
  defaultCity: null,
  cities: [],
};
