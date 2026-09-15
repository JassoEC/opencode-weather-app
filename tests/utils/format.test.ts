import { describe, expect, it } from "bun:test";
import {
  visibleLength,
  pad,
  unitSymbol,
  formatTemperature,
  sameCityName,
  cityLabel,
  describeWeather,
  weekdayLabel,
} from "../../src/utils/format.ts";
import { UNKNOWN } from "../../src/utils/constants.ts";

describe("visibleLength", () => {
  it("returns plain string length", () => {
    expect(visibleLength("hello")).toBe(5);
  });

  it("ignores ANSI codes", () => {
    const ansi = "\x1b[36mMadrid\x1b[39m";
    expect(visibleLength(ansi)).toBe(6);
  });

  it("handles empty string", () => {
    expect(visibleLength("")).toBe(0);
  });
});

describe("pad", () => {
  it("pads shorter text", () => {
    expect(pad("hi", 5)).toBe("hi   ");
  });

  it("returns original if already wide enough", () => {
    expect(pad("hello", 3)).toBe("hello");
  });

  it("handles exact width", () => {
    expect(pad("abc", 3)).toBe("abc");
  });
});

describe("unitSymbol", () => {
  it("returns °C for celsius", () => {
    expect(unitSymbol("celsius")).toBe("°C");
  });

  it("returns °F for fahrenheit", () => {
    expect(unitSymbol("fahrenheit")).toBe("°F");
  });
});

describe("formatTemperature", () => {
  it("formats with one decimal", () => {
    expect(formatTemperature(22.567)).toBe("22.6");
  });

  it("formats integer values", () => {
    expect(formatTemperature(15)).toBe("15.0");
  });

  it("formats negative values", () => {
    expect(formatTemperature(-3.4)).toBe("-3.4");
  });
});

describe("sameCityName", () => {
  it("matches same names case-insensitively", () => {
    expect(sameCityName("Madrid", "madrid")).toBe(true);
  });

  it("trims whitespace", () => {
    expect(sameCityName("  Madrid  ", "Madrid")).toBe(true);
  });

  it("rejects different names", () => {
    expect(sameCityName("Madrid", "Barcelona")).toBe(false);
  });
});

describe("cityLabel", () => {
  it("joins name, admin1, country", () => {
    expect(
      cityLabel({ name: "Madrid", admin1: "Madrid", country: "España", latitude: 0, longitude: 0 })
    ).toBe("Madrid, Madrid, España");
  });

  it("skips empty admin1", () => {
    expect(
      cityLabel({ name: "Berlin", admin1: "", country: "Alemania", latitude: 0, longitude: 0 })
    ).toBe("Berlin, Alemania");
  });

  it("skips empty country", () => {
    expect(
      cityLabel({ name: "X", admin1: "Y", country: "", latitude: 0, longitude: 0 })
    ).toBe("X, Y");
  });
});

describe("describeWeather", () => {
  it("returns condition for known code", () => {
    const c = describeWeather(0);
    expect(c.text).toBe("Despejado");
    expect(c.emoji).toBe("☀️");
  });

  it("returns UNKNOWN for unknown code", () => {
    expect(describeWeather(999)).toBe(UNKNOWN);
  });

  it("returns condition for code 95", () => {
    expect(describeWeather(95).text).toBe("Tormenta");
  });
});

describe("weekdayLabel", () => {
  it("formats a valid ISO date", () => {
    const label = weekdayLabel("2025-01-13");
    expect(label.length).toBeGreaterThan(0);
    expect(label).not.toContain(".");
  });

  it("returns raw string for invalid date", () => {
    expect(weekdayLabel("not-a-date")).toBe("not-a-date");
  });

  it("returns raw string for empty", () => {
    expect(weekdayLabel("")).toBe("");
  });
});
