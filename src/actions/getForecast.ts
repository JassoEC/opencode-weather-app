import type { AppState } from "../types/City.ts";
import { fetchDaily } from "../api/weather.ts";
import { cityLabel, formatTemperature, unitSymbol, weekdayLabel, describeWeather, pad } from "../utils/format.ts";
import { warn, pause, withSpinner, blank, info } from "../presentation/output.ts";
import { cyan, dim, yellow } from "../utils/colors.ts";
import { pickIndex } from "../presentation/input.ts";

export async function run(state: AppState): Promise<void> {
  if (state.cities.length === 0) {
    warn("No hay ciudades. Agrega una primero (opción 3).");
    return pause();
  }
  const idx = pickIndex(state, "   Número de la ciudad: ");
  if (idx === null) return;
  const city = state.cities[idx];
  if (!city) return;

  const sym = unitSymbol(state.unit);
  const fmt = (v: number): string =>
    Number.isFinite(v) ? `${formatTemperature(v)}${sym}` : "—";

  const days = await withSpinner(
    "Cargando pronóstico...",
    fetchDaily(city, state.unit, 7),
  );
  blank();
  info(cyan(`📍 ${cityLabel(city)}`));
  info(dim(`${pad("Día", 13)}${pad("Mín", 8)}${pad("Máx", 8)}Condición`));
  info(dim("   " + "─".repeat(46)));
  for (const d of days) {
    const c = describeWeather(d.code);
    const line =
      pad(weekdayLabel(d.date), 13) +
      cyan(pad(fmt(d.min), 8)) +
      yellow(pad(fmt(d.max), 8)) +
      `${c.emoji} ${c.text}`;
    info(line);
  }
  pause();
}
