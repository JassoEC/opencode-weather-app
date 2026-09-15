import type { AppState } from "../types/City.ts";
import { fetchTemperature } from "../api/weather.ts";
import { sameCityName } from "../utils/format.ts";
import { warn, pause, withSpinner, blank, info, success, hint } from "../presentation/output.ts";
import { cyan, yellow } from "../utils/colors.ts";
import { cityLabel, formatTemperature } from "../utils/format.ts";

function findCity(state: AppState, name: string) {
  return state.cities.find((c) => sameCityName(c.name, name));
}

export async function run(state: AppState): Promise<void> {
  if (!state.defaultCity) {
    warn("No hay ciudad default. Usa la opción 5 para establecerla.");
    return pause();
  }
  const city = findCity(state, state.defaultCity);
  if (!city) {
    warn("La ciudad default ya no está registrada.");
    return pause();
  }
  const { temperature, unit } = await withSpinner(
    "Consultando el clima...",
    fetchTemperature(city, state.unit),
  );
  blank();
  info(cyan(`📍 ${cityLabel(city)}`));
  info(`Temperatura: ${yellow(`${formatTemperature(temperature)}${unit}`)}`);
  pause();
}
