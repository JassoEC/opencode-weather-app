import type { City } from "../../src/types/City.ts";

export const CITY_MADRID: City = {
  name: "Madrid",
  admin1: "Madrid",
  country: "España",
  latitude: 40.4168,
  longitude: -3.7038,
};

export const CITY_BERLIN: City = {
  name: "Berlin",
  admin1: "Land Berlin",
  country: "Alemania",
  latitude: 52.5244,
  longitude: 13.4105,
};

export const GEOCODE_RESPONSE_EMPTY = { results: [] };

export const GEOCODE_RESPONSE_TWO = {
  results: [
    { name: "Madrid", latitude: 40.4168, longitude: -3.7038, country: "España", admin1: "Madrid" },
    { name: "Madrid", latitude: 40.4168, longitude: -3.7038, country: "Colombia", admin1: "Cundinamarca" },
  ],
};

export const FORECAST_RESPONSE = {
  current: {
    temperature_2m: 22.5,
    temperature_unit: "°C",
  },
  current_units: {
    temperature_2m: "°C",
  },
};

export const FORECAST_RESPONSE_NO_TEMP = {
  current: {},
  current_units: {},
};

export const DAILY_RESPONSE = {
  daily: {
    time: ["2025-01-13", "2025-01-14", "2025-01-15"],
    temperature_2m_max: [15.0, 12.5, 18.0],
    temperature_2m_min: [5.0, 3.2, 8.1],
    weather_code: [0, 61, 95],
  },
};

export const DAILY_RESPONSE_MISSING_MAX = {
  daily: {
    time: ["2025-01-13"],
    temperature_2m_min: [5.0],
  },
};
