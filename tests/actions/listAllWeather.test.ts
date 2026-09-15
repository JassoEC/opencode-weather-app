import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { AppState } from "../../src/types/City.ts";
import { CITY_MADRID, CITY_BERLIN, FORECAST_RESPONSE } from "../fixtures/api.ts";

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

const { run: listAllWeather } = await import("../../src/actions/listAllWeather.ts");

function makeState(overrides: Partial<AppState> = {}): AppState {
  return {
    cities: [CITY_MADRID, CITY_BERLIN],
    defaultCity: "Madrid",
    unit: "celsius",
    ...overrides,
  };
}

describe("listAllWeather", () => {
  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "weather-test-list-"));
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

  it("warns when no cities registered", async () => {
    const state = makeState({ cities: [] });
    await listAllWeather(state);
    expect(mockWarn).toHaveBeenCalled();
    expect(mockPause).toHaveBeenCalled();
  });

  it("shows weather for all cities", async () => {
    const state = makeState();
    await listAllWeather(state);
    expect(mockInfo).toHaveBeenCalledTimes(2);
    expect(mockPause).toHaveBeenCalled();
  });

  it("marks default city with asterisk", async () => {
    const state = makeState({ defaultCity: "Berlin" });
    await listAllWeather(state);
    expect(mockInfo).toHaveBeenCalledTimes(2);
  });
});
