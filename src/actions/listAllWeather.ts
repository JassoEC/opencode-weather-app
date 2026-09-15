import type { AppState } from "../types/City.ts";
import type { CityWeather } from "../types/Weather.ts";
import { fetchTemperature } from "../api/weather.ts";
import { sameCityName, cityLabel, formatTemperature, pad } from "../utils/format.ts";
import { warn, pause, withSpinner, blank, info } from "../presentation/output.ts";
import { cyan, yellow } from "../utils/colors.ts";

async function weatherForAll(cities: AppState["cities"], unit: AppState["unit"]): Promise<CityWeather[]> {
  return Promise.all(
    cities.map(async (c) => {
      const { temperature, unit: sym } = await fetchTemperature(c, unit);
      return { ...c, temperature, unit: sym };
    }),
  );
}

export async function run(state: AppState): Promise<void> {
  if (state.cities.length === 0) {
    warn("No hay ciudades registradas. Usa la opción 3 para agregar.");
    return pause();
  }
  const list = await withSpinner(
    "Consultando el clima...",
    weatherForAll(state.cities, state.unit),
  );
  blank();
  const width = Math.max(...list.map((c) => c.name.length));
  for (const c of list) {
    const isDefault = sameCityName(c.name, state.defaultCity ?? "");
    const star = isDefault ? ` ${yellow("*")}` : "  ";
    const nameCell = cyan(pad(c.name, width));
    const tempCell = yellow(`${formatTemperature(c.temperature)}${c.unit}`);
    info(`${star}${nameCell}  ${tempCell}`);
  }
  pause();
}
