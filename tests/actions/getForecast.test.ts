import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { AppState } from "../../src/types/City.ts";
import { CITY_MADRID, DAILY_RESPONSE } from "../fixtures/api.ts";

let tempDir: string;
const originalHome = process.env.HOME;
const originalFetch = globalThis.fetch;

const mockWarn = mock(() => {});
const mockPause = mock(() => {});
const mockInfo = mock(() => {});
let mockPickIndex: number | null = 0;

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
  pickIndex: () => mockPickIndex,
}));

const { run: getForecast } = await import("../../src/actions/getForecast.ts");

function makeState(overrides: Partial<AppState> = {}): AppState {
  return {
    cities: [CITY_MADRID],
    defaultCity: "Madrid",
    unit: "celsius",
    ...overrides,
  };
}

describe("getForecast", () => {
  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "weather-test-forecast-"));
    process.env.HOME = tempDir;
    mockWarn.mockClear();
    mockPause.mockClear();
    mockInfo.mockClear();
    mockPickIndex = 0;
    globalThis.fetch = async () =>
      new Response(JSON.stringify(DAILY_RESPONSE), { status: 200 });
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
    await getForecast(state);
    expect(mockWarn).toHaveBeenCalled();
    expect(mockPause).toHaveBeenCalled();
  });

  it("does nothing when cancelled", async () => {
    const state = makeState();
    mockPickIndex = null;
    await getForecast(state);
    expect(mockInfo).not.toHaveBeenCalled();
  });

  it("renders forecast table on success", async () => {
    const state = makeState();
    await getForecast(state);
    expect(mockInfo).toHaveBeenCalled();
    expect(mockPause).toHaveBeenCalled();
  });
});
