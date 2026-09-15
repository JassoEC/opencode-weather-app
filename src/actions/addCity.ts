import type { AppState } from "../types/City.ts";
import { geocode } from "../api/geocoding.ts";
import { sameCityName, cityLabel } from "../utils/format.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { warn, pause, withSpinner, success, hint } from "../presentation/output.ts";
import { ask } from "../presentation/input.ts";
import { cyan } from "../utils/colors.ts";

export async function run(state: AppState): Promise<void> {
  const query = ask(cyan("   Nombre de la ciudad a buscar: "));
  if (!query) {
    warn("Búsqueda vacía, se canceló.");
    return pause();
  }
  const city = await withSpinner("Buscando ciudad...", geocode(query));
  if (state.cities.some((c) => sameCityName(c.name, city.name))) {
    warn(`"${city.name}" ya está registrada.`);
    return pause();
  }
  state.cities.push(city);
  const isFirst = state.defaultCity === null;
  if (isFirst) state.defaultCity = city.name;
  saveCities(state.cities);
  success(`Agregada: ${cityLabel(city)}`);
  if (isFirst) hint("Ahora es la ciudad default.");
  pause();
}
