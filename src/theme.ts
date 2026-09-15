const useColor =
  !process.env.NO_COLOR &&
  process.env.TERM !== "dumb" &&
  Boolean(process.stdout.isTTY);

export const colorsEnabled = useColor;

type Painter = (text: string) => string;

function wrap(open: string, close: string): Painter {
  return (text) => (useColor ? `${open}${text}${close}` : text);
}

export const bold = wrap("\x1b[1m", "\x1b[22m");
export const dim = wrap("\x1b[2m", "\x1b[22m");
export const cyan = wrap("\x1b[36m", "\x1b[39m");
export const yellow = wrap("\x1b[33m", "\x1b[39m");
export const green = wrap("\x1b[32m", "\x1b[39m");
export const red = wrap("\x1b[31m", "\x1b[39m");

const ANSI_RE = /\x1b\[[0-9;]*m/g;

export function visibleLength(text: string): number {
  return [...text.replace(ANSI_RE, "")].length;
}

export function pad(text: string, width: number): string {
  const diff = width - visibleLength(text);
  return diff > 0 ? text + " ".repeat(diff) : text;
}
