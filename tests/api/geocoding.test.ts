import { describe, expect, it, spyOn, beforeEach, afterEach } from "bun:test";
import { geocode } from "../../src/api/geocoding.ts";
import { CITY_MADRID, GEOCODE_RESPONSE_EMPTY, GEOCODE_RESPONSE_TWO } from "../fixtures/api.ts";

describe("geocode", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns first city on success", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ results: [{ name: "Madrid", latitude: 40.4, longitude: -3.7, country: "España", admin1: "Madrid" }] }), { status: 200 });

    const city = await geocode("Madrid");
    expect(city.name).toBe("Madrid");
    expect(city.latitude).toBe(40.4);
    expect(city.country).toBe("España");
  });

  it("throws on empty results", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify(GEOCODE_RESPONSE_EMPTY), { status: 200 });

    await expect(geocode("NoExista")).rejects.toThrow("No se encontró");
  });

  it("throws on non-ok status", async () => {
    globalThis.fetch = async () => new Response("error", { status: 500 });
    await expect(geocode("X")).rejects.toThrow("Error de geocodificación");
  });

  it("handles missing optional fields", async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({ results: [{ name: "X", latitude: 1, longitude: 2 }] }),
        { status: 200 }
      );

    const city = await geocode("X");
    expect(city.country).toBe("");
    expect(city.admin1).toBe("");
  });

  it("returns first result when multiple", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify(GEOCODE_RESPONSE_TWO), { status: 200 });

    const city = await geocode("Madrid");
    expect(city.name).toBe("Madrid");
    expect(city.country).toBe("España");
  });
});
