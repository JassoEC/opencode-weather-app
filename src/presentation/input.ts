import type { AppState } from "../types/City.ts";
import { cyan, yellow } from "../utils/colors.ts";
import { sameCityName } from "../utils/format.ts";
import { warn } from "./output.ts";

export function ask(message: string): string {
  const value = prompt(message);
  return (value ?? "").trim();
}

export function listChoices(state: AppState): void {
  state.cities.forEach((c, i) => {
    const isDefault = sameCityName(c.name, state.defaultCity ?? "");
    const mark = isDefault ? yellow("*") : " ";
    console.log(`   ${mark} ${cyan(`${i + 1}.`)} ${c.name}`);
  });
}

export function pickIndex(state: AppState, message: string): number | null {
  listChoices(state);
  const raw = ask(cyan(message));
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > state.cities.length) {
    warn("Opción no válida.");
    return null;
  }
  return n - 1;
}
