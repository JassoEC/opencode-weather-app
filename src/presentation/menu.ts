import type { AppState } from "../types/City.ts";
import { unitSymbol } from "../utils/format.ts";
import { bold, cyan, yellow } from "../utils/colors.ts";

const BAR = cyan("═".repeat(40));

export function renderMenu(config: AppState): void {
  const count = yellow(String(config.cities.length));
  const unit = yellow(unitSymbol(config.unit));
  const option = (key: string, text: string): string => `  ${cyan(`${key}.`)} ${text}`;
  const lines = [
    "",
    BAR,
    cyan(bold("         WEATHER CLI")),
    BAR,
    option("1", "Clima de ciudad default"),
    option("2", `Clima de todas las ciudades (${count})`),
    option("3", "Buscar y agregar ciudad"),
    option("4", "Eliminar ciudad"),
    option("5", "Establecer ciudad default"),
    option("6", "Pronóstico 7 días"),
    option("8", `Ajustes (${unit})`),
    option("9", "Salir"),
    BAR,
  ];
  process.stdout.write(`${lines.join("\n")}\n`);
}
