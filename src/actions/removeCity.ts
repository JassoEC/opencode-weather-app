import type { AppState } from "../types/City.ts";
import { sameCityName } from "../utils/format.ts";
import { saveCities, loadCities } from "../storage/citiesStorage.ts";
import { warn, pause, success } from "../presentation/output.ts";
import { pickIndex } from "../presentation/input.ts";

export function run(state: AppState): void {
  if (state.cities.length === 0) {
    warn("No hay ciudades para eliminar.");
    return pause();
  }
  const idx = pickIndex(state, "   Número de ciudad a eliminar: ");
  if (idx === null) return;
  const [removed] = state.cities.splice(idx, 1);
  if (removed && state.defaultCity && sameCityName(state.defaultCity, removed.name)) {
    state.defaultCity = null;
  }
  saveCities(state.cities);
  if (removed) success(`Eliminada: ${removed.name}`);
  pause();
}
