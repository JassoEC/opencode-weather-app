import type { AppState } from "../types/City.ts";
import { saveSettings } from "../storage/settingsStorage.ts";
import { pause, success } from "../presentation/output.ts";
import { unitSymbol } from "../utils/format.ts";

export function run(state: AppState): void {
  state.unit = state.unit === "celsius" ? "fahrenheit" : "celsius";
  saveSettings({ unit: state.unit, defaultCity: state.defaultCity });
  success(`Unidad cambiada a ${unitSymbol(state.unit)}`);
  pause();
}
