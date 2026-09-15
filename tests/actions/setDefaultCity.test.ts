import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { AppState } from "../../src/types/City.ts";
import { CITY_MADRID, CITY_BERLIN } from "../fixtures/api.ts";

let tempDir: string;
const originalHome = process.env.HOME;

const mockWarn = mock(() => {});
const mockPause = mock(() => {});
const mockSuccess = mock(() => {});
const mockSaveSettings = mock(() => {});
let mockPickIndex: number | null = 0;

mock.module("../../src/storage/settingsStorage.ts", () => ({
  saveSettings: mockSaveSettings,
}));
mock.module("../../src/presentation/output.ts", () => ({
  success: mockSuccess,
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
  pickIndex: () => mockPickIndex,
}));

const { run: setDefaultCity } = await import("../../src/actions/setDefaultCity.ts");

function makeState(overrides: Partial<AppState> = {}): AppState {
  return {
    cities: [CITY_MADRID, CITY_BERLIN],
    defaultCity: null,
    unit: "celsius",
    ...overrides,
  };
}

describe("setDefaultCity", () => {
  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "weather-test-default-"));
    process.env.HOME = tempDir;
    mockWarn.mockClear();
    mockSuccess.mockClear();
    mockPause.mockClear();
    mockSaveSettings.mockClear();
    mockPickIndex = 0;
  });

  afterEach(() => {
    if (originalHome !== undefined) {
      process.env.HOME = originalHome;
    } else {
      delete process.env.HOME;
    }
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("warns when no cities registered", () => {
    const state = makeState({ cities: [] });
    setDefaultCity(state);
    expect(mockWarn).toHaveBeenCalled();
    expect(mockPause).toHaveBeenCalled();
    expect(state.defaultCity).toBeNull();
  });

  it("sets default city and persists", () => {
    const state = makeState();
    mockPickIndex = 1;
    setDefaultCity(state);
    expect(state.defaultCity).toBe("Berlin");
    expect(mockSaveSettings).toHaveBeenCalledWith({ unit: "celsius", defaultCity: "Berlin" });
    expect(mockSuccess).toHaveBeenCalled();
  });

  it("does nothing when cancelled", () => {
    const state = makeState();
    mockPickIndex = null;
    setDefaultCity(state);
    expect(state.defaultCity).toBeNull();
    expect(mockSaveSettings).not.toHaveBeenCalled();
  });

  it("does nothing on invalid index", () => {
    const state = makeState();
    mockPickIndex = 99;
    setDefaultCity(state);
    expect(state.defaultCity).toBeNull();
  });
});
