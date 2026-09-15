import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { AppState } from "../../src/types/City.ts";

let tempDir: string;
const originalHome = process.env.HOME;
const originalFetch = globalThis.fetch;

const mockWarn = mock(() => {});
const mockPause = mock(() => {});
const mockPickIndex = mock(() => null);

mock.module("../../src/presentation/output.ts", () => ({
  success: () => {},
  warn: mockWarn,
  pause: mockPause,
  info: () => {},
  fail: () => {},
  blank: () => {},
  hint: () => {},
  withSpinner: (_label: string, task: Promise<unknown>) => task,
}));
mock.module("../../src/presentation/input.ts", () => ({
  ask: () => "",
  listChoices: () => {},
  pickIndex: mockPickIndex,
}));

const { run: removeCity } = await import("../../src/actions/removeCity.ts");

function makeState(overrides: Partial<AppState> = {}): AppState {
  return {
    cities: [],
    defaultCity: null,
    unit: "celsius",
    ...overrides,
  };
}

describe("removeCity", () => {
  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "weather-test-remove-"));
    process.env.HOME = tempDir;
    mockWarn.mockClear();
    mockPause.mockClear();
    mockPickIndex.mockClear();
  });

  afterEach(() => {
    if (originalHome !== undefined) {
      process.env.HOME = originalHome;
    } else {
      delete process.env.HOME;
    }
    globalThis.fetch = originalFetch;
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("warns when no cities exist", () => {
    const state = makeState({ cities: [] });
    removeCity(state);
    expect(mockWarn).toHaveBeenCalledWith("No hay ciudades para eliminar.");
  });
});
