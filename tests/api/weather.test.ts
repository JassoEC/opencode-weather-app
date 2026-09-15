import { describe, expect, it, afterEach } from "bun:test";
import { fetchTemperature, fetchDaily } from "../../src/api/weather.ts";
import {
  CITY_MADRID,
  CITY_BERLIN,
  FORECAST_RESPONSE,
  FORECAST_RESPONSE_NO_TEMP,
  DAILY_RESPONSE,
} from "../fixtures/api.ts";

describe("fetchTemperature", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns temperature on success", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify(FORECAST_RESPONSE), { status: 200 });

    const result = await fetchTemperature(CITY_MADRID, "celsius");
    expect(result.temperature).toBe(22.5);
    expect(result.unit).toBe("°C");
  });

  it("throws on non-ok status", async () => {
    globalThis.fetch = async () => new Response("error", { status: 429 });
    await expect(fetchTemperature(CITY_MADRID, "celsius")).rejects.toThrow("Error al consultar el clima");
  });

  it("throws when temperature is missing", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify(FORECAST_RESPONSE_NO_TEMP), { status: 200 });

    await expect(fetchTemperature(CITY_MADRID, "celsius")).rejects.toThrow("El clima no incluye temperatura actual");
  });

  it("uses fahrenheit unit in URL", async () => {
    let calledUrl = "";
    globalThis.fetch = async (url: string | URL | Request) => {
      calledUrl = String(url);
      return new Response(JSON.stringify({ ...FORECAST_RESPONSE, current_units: { temperature_2m: "°F" } }), { status: 200 });
    };

    await fetchTemperature(CITY_BERLIN, "fahrenheit");
    expect(calledUrl).toContain("temperature_unit=fahrenheit");
  });
});

describe("fetchDaily", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns daily forecasts on success", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify(DAILY_RESPONSE), { status: 200 });

    const days = await fetchDaily(CITY_MADRID, "celsius", 3);
    expect(days).toHaveLength(3);
    expect(days[0].date).toBe("2025-01-13");
    expect(days[0].min).toBe(5.0);
    expect(days[0].max).toBe(15.0);
    expect(days[0].code).toBe(0);
  });

  it("throws on non-ok status", async () => {
    globalThis.fetch = async () => new Response("error", { status: 500 });
    await expect(fetchDaily(CITY_MADRID, "celsius")).rejects.toThrow("Error al consultar el pronóstico");
  });

  it("throws when daily data is missing", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ daily: {} }), { status: 200 });

    await expect(fetchDaily(CITY_MADRID, "celsius")).rejects.toThrow("El pronóstico no incluye datos diarios");
  });

  it("defaults code to -1 when weather_code missing", async () => {
    const responseWithoutCode = {
      daily: {
        time: ["2025-01-13"],
        temperature_2m_max: [15.0],
        temperature_2m_min: [5.0],
      },
    };
    globalThis.fetch = async () =>
      new Response(JSON.stringify(responseWithoutCode), { status: 200 });

    const days = await fetchDaily(CITY_MADRID, "celsius", 1);
    expect(days[0].code).toBe(-1);
    expect(days[0].min).toBe(5.0);
    expect(days[0].max).toBe(15.0);
  });
});
