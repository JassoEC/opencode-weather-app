import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { AppState } from "../../src/types/City.ts";
import { CITY_MADRID, FORECAST_RESPONSE } from "../fixtures/api.ts";

let tempDir: string;
const originalHome = process.env.HOME;
const originalFetch = globalThis.fetch;

const mockWarn = mock(() => {});
const mockPause = mock(() => {});
const mockInfo = mock(() => {});

mock.module("../../src/presentation/output.ts", () => ({
  warn: mockWarn,
  pause: mockPause,
  info: mockInfo,
  success: () => {},
  fail: () => {},
  blank: () => {},
  hint: () => {},
  withSpinner: (_label: string, task: Promise<unknown>) => task,
}));
mock.module("../../src/presentation/input.ts", () => ({
  ask: () => "",
  listChoices: () => {},
  pickIndex: () => null,
}));

const { run: getWeather } = await import("../../src/actions/getWeather.ts");

function makeState(overrides: Partial<AppState> = {}): AppState {
  return {
    cities: [CITY_MADRID],
    defaultCity: "Madrid",
    unit: "celsius",
    ...overrides,
  };
}

describe("getWeather", () => {
  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "weather-test-weather-"));
    process.env.HOME = tempDir;
    mockWarn.mockClear();
    mockPause.mockClear();
    mockInfo.mockClear();
    globalThis.fetch = async () =>
      new Response(JSON.stringify(FORECAST_RESPONSE), { status: 200 });
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

  it("warns when no default city", async () => {
    const state = makeState({ defaultCity: null });
    await getWeather(state);
    expect(mockWarn).toHaveBeenCalled();
    expect(mockPause).toHaveBeenCalled();
  });

  it("warns when default city is not registered", async () => {
    const state = makeState({ cities: [], defaultCity: "Lyon" });
    await getWeather(state);
    expect(mockWarn).toHaveBeenCalled();
  });

  it("displays temperature on success", async () => {
    const state = makeState();
    await getWeather(state);
    expect(mockInfo).toHaveBeenCalled();
    expect(mockPause).toHaveBeenCalled();
  });
});
