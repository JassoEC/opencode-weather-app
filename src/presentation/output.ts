import { colorsEnabled, cyan, dim, green, red, yellow } from "../utils/colors.ts";

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

export function pause(): void {
  prompt(cyan("   Presiona Enter para continuar..."));
}
