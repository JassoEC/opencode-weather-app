import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { AppState } from "../../src/types/City.ts";

let tempDir: string;
const originalHome = process.env.HOME;
const originalFetch = globalThis.fetch;

const mockSaveSettings = mock(() => {});
const mockSuccess = mock(() => {});
const mockPause = mock(() => {});

mock.module("../../src/storage/settingsStorage.ts", () => ({
  saveSettings: mockSaveSettings,
}));
mock.module("../../src/presentation/output.ts", () => ({
  success: mockSuccess,
  pause: mockPause,
  warn: () => {},
  info: () => {},
  fail: () => {},
  blank: () => {},
  hint: () => {},
  withSpinner: (_label: string, task: Promise<unknown>) => task,
}));

const { run: toggleUnit } = await import("../../src/actions/toggleUnit.ts");

function makeState(overrides: Partial<AppState> = {}): AppState {
  return {
    cities: [],
    defaultCity: null,
    unit: "celsius",
    ...overrides,
  };
}

describe("toggleUnit", () => {
  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "weather-test-toggle-"));
    process.env.HOME = tempDir;
    mockSaveSettings.mockClear();
    mockSuccess.mockClear();
    mockPause.mockClear();
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

  it("switches from celsius to fahrenheit", () => {
    const state = makeState({ unit: "celsius", defaultCity: "Madrid" });
    toggleUnit(state);
    expect(state.unit).toBe("fahrenheit");
    expect(mockSaveSettings).toHaveBeenCalledWith({ unit: "fahrenheit", defaultCity: "Madrid" });
    expect(mockSuccess).toHaveBeenCalled();
  });

  it("switches from fahrenheit to celsius", () => {
    const state = makeState({ unit: "fahrenheit" });
    toggleUnit(state);
    expect(state.unit).toBe("celsius");
    expect(mockSaveSettings).toHaveBeenCalledWith({ unit: "celsius", defaultCity: null });
  });

  it("persists defaultCity along with unit", () => {
    const state = makeState({ unit: "celsius", defaultCity: "Berlin" });
    toggleUnit(state);
    expect(mockSaveSettings).toHaveBeenCalledWith({ unit: "fahrenheit", defaultCity: "Berlin" });
  });
});
