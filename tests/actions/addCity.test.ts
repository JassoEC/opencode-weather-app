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
const mockSuccess = mock(() => {});
const mockHint = mock(() => {});
let mockAskValue = "Madrid";

const GEOCODE_RESPONSE = {
  results: [
    { name: "Madrid", latitude: 40.4168, longitude: -3.7038, country: "España", admin1: "Madrid" },
  ],
};

mock.module("../../src/presentation/output.ts", () => ({
  success: mockSuccess,
  warn: mockWarn,
  pause: mockPause,
  hint: mockHint,
  info: () => {},
  fail: () => {},
  blank: () => {},
  withSpinner: (_label: string, task: Promise<unknown>) => task,
}));
mock.module("../../src/presentation/input.ts", () => ({
  ask: () => mockAskValue,
  listChoices: () => {},
  pickIndex: () => null,
}));

const { run: addCity } = await import("../../src/actions/addCity.ts");

function makeState(overrides: Partial<AppState> = {}): AppState {
  return {
    cities: [],
    defaultCity: null,
    unit: "celsius",
    ...overrides,
  };
}

describe("addCity", () => {
  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "weather-test-add-"));
    process.env.HOME = tempDir;
    mockWarn.mockClear();
    mockSuccess.mockClear();
    mockHint.mockClear();
    mockPause.mockClear();
    mockAskValue = "Madrid";
    globalThis.fetch = async () =>
      new Response(JSON.stringify(GEOCODE_RESPONSE), { status: 200 });
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

  it("adds city and sets as default when first", async () => {
    const state = makeState();
    await addCity(state);
    expect(state.cities).toHaveLength(1);
    expect(state.cities[0].name).toBe("Madrid");
    expect(state.defaultCity).toBe("Madrid");
  });

  it("does not add duplicate city", async () => {
    const state = makeState({
      cities: [{ name: "Madrid", admin1: "Madrid", country: "España", latitude: 40.4, longitude: -3.7 }],
    });
    await addCity(state);
    expect(state.cities).toHaveLength(1);
    expect(mockWarn).toHaveBeenCalledWith('"Madrid" ya está registrada.');
  });

  it("does not change default when not first city", async () => {
    const state = makeState({ defaultCity: "Berlin" });
    await addCity(state);
    expect(state.defaultCity).toBe("Berlin");
  });

  it("warns on empty query", async () => {
    mockAskValue = "";
    const state = makeState();
    await addCity(state);
    expect(mockWarn).toHaveBeenCalledWith("Búsqueda vacía, se canceló.");
    expect(state.cities).toHaveLength(0);
  });
});
