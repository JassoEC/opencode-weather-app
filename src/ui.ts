import type { Config } from "./config.ts";
import { unitSymbol } from "./weather.ts";

const LINE = "═".repeat(40);

export function clear(): void {
  process.stdout.write("\x1b[2J\x1b[H");
}

export function renderMenu(config: Config): void {
  const count = config.cities.length;
  const unit = unitSymbol(config.unit);
  const lines = [
    "",
    LINE,
    "         WEATHER CLI",
    LINE,
    "  1. Clima de ciudad default",
    `  2. Clima de todas las ciudades (${count})`,
    "  3. Buscar y agregar ciudad",
    "  4. Eliminar ciudad",
    "  5. Establecer ciudad default",
    `  8. Ajustes (${unit})`,
    "  9. Salir",
    LINE,
  ];
  process.stdout.write(`${lines.join("\n")}\n`);
}

export function info(message: string): void {
  console.log(`   ${message}`);
}

export function success(message: string): void {
  console.log(`   ✓ ${message}`);
}

export function warn(message: string): void {
  console.log(`   ! ${message}`);
}

export function fail(message: string): void {
  console.log(`   ✗ ${message}`);
}

export function blank(): void {
  console.log("");
}
