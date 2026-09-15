import type { AppState } from "./types/City.ts";
import type { MenuOption } from "./types/MenuOption.ts";
import { migrateIfNeeded } from "./storage/migrate.ts";
import { loadCities } from "./storage/citiesStorage.ts";
import { loadSettings } from "./storage/settingsStorage.ts";
import { renderMenu } from "./presentation/menu.ts";
import { blank, info, fail, pause } from "./presentation/output.ts";
import { ask } from "./presentation/input.ts";
import { cyan } from "./utils/colors.ts";

import * as getWeather from "./actions/getWeather.ts";
import * as listAllWeather from "./actions/listAllWeather.ts";
import * as addCity from "./actions/addCity.ts";
import * as removeCity from "./actions/removeCity.ts";
import * as setDefaultCity from "./actions/setDefaultCity.ts";
import * as getForecast from "./actions/getForecast.ts";
import * as toggleUnit from "./actions/toggleUnit.ts";

const OPTIONS: MenuOption[] = [
  { key: "1", label: "Clima de ciudad default", run: getWeather.run },
  { key: "2", label: "Clima de todas las ciudades", run: listAllWeather.run },
  { key: "3", label: "Buscar y agregar ciudad", run: addCity.run },
  { key: "4", label: "Eliminar ciudad", run: removeCity.run },
  { key: "5", label: "Establecer ciudad default", run: setDefaultCity.run },
  { key: "6", label: "Pronóstico 7 días", run: getForecast.run },
  { key: "8", label: "Ajustes", run: toggleUnit.run },
];

async function main(): Promise<void> {
  migrateIfNeeded();
  const state: AppState = {
    cities: loadCities(),
    ...loadSettings(),
  };
  let running = true;

  while (running) {
    renderMenu(state);
    const option = ask(cyan("   Selecciona una opción: "));
    blank();
    if (option === "9") {
      running = false;
      blank();
      info(cyan("¡Hasta pronto! ☀"));
      break;
    }
    if (option === "") continue;

    const chosen = OPTIONS.find((o) => o.key === option);
    if (!chosen) {
      fail(`Opción no reconocida: "${option}".`);
      pause();
      continue;
    }

    try {
      await chosen.run(state);
    } catch (error) {
      fail(error instanceof Error ? error.message : "Error inesperado.");
      pause();
    }
  }
}

void main();
