import type { Config } from "./config.ts";
import { unitSymbol } from "./weather.ts";
import { bold, colorsEnabled, cyan, dim, green, red, yellow } from "./theme.ts";

const BAR = cyan("═".repeat(40));

export function clear(): void {
  process.stdout.write("\x1b[2J\x1b[H");
}

export function renderMenu(config: Config): void {
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
    option("8", `Ajustes (${unit})`),
    option("9", "Salir"),
    BAR,
  ];
  process.stdout.write(`${lines.join("\n")}\n`);
}

export async function withSpinner<T>(label: string, task: Promise<T>): Promise<T> {
  if (!colorsEnabled) return task;
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  const render = (): void => {
    i = (i + 1) % frames.length;
    const frame = frames[i] ?? "•";
    process.stdout.write(`\r   ${cyan(frame)} ${dim(label)}`);
  };
  render();
  const id = setInterval(render, 80);
  try {
    return await task;
  } finally {
    clearInterval(id);
    process.stdout.write("\r\x1b[K");
  }
}

export function info(message: string): void {
  console.log(`   ${message}`);
}

export function hint(message: string): void {
  console.log(dim(`   ${message}`));
}

export function success(message: string): void {
  console.log(`${green(`   ✓ ${message}`)}`);
}

export function warn(message: string): void {
  console.log(`${yellow(`   ! ${message}`)}`);
}

export function fail(message: string): void {
  console.log(`${red(`   ✗ ${message}`)}`);
}

export function blank(): void {
  console.log("");
}
