import type { AppState } from "../types/City.ts";
import { saveSettings } from "../storage/settingsStorage.ts";
import { warn, pause, success } from "../presentation/output.ts";
import { pickIndex } from "../presentation/input.ts";

export function run(state: AppState): void {
  if (state.cities.length === 0) {
    warn("No hay ciudades. Agrega una primero (opción 3).");
    return pause();
  }
  const idx = pickIndex(state, "   Número de la ciudad default: ");
  if (idx === null) return;
  const city = state.cities[idx];
  if (!city) return;
  state.defaultCity = city.name;
  saveSettings({ unit: state.unit, defaultCity: state.defaultCity });
  success(`Ciudad default: ${city.name}`);
  pause();
}
