import type { AppState } from "./City.ts";

export interface MenuOption {
  key: string;
  label: string;
  run: (ctx: AppState) => Promise<void> | void;
}
