import type { WeatherCondition } from "../types/Weather.ts";

export const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
export const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export const CONDITIONS: Record<number, WeatherCondition> = {
  0: { text: "Despejado", emoji: "☀️" },
  1: { text: "Mayormente despejado", emoji: "🌤️" },
  2: { text: "Parcialmente nuboso", emoji: "⛅" },
  3: { text: "Nublado", emoji: "☁️" },
  45: { text: "Niebla", emoji: "🌫️" },
  48: { text: "Niebla con escarcha", emoji: "🌫️" },
  51: { text: "Llovizna ligera", emoji: "🌦️" },
  53: { text: "Llovizna", emoji: "🌦️" },
  55: { text: "Llovizna intensa", emoji: "🌧️" },
  56: { text: "Llovizna helada", emoji: "🌧️" },
  57: { text: "Llovizna helada intensa", emoji: "🌧️" },
  61: { text: "Lluvia ligera", emoji: "🌦️" },
  63: { text: "Lluvia", emoji: "🌧️" },
  65: { text: "Lluvia intensa", emoji: "🌧️" },
  66: { text: "Lluvia helada", emoji: "🌧️" },
  67: { text: "Lluvia helada intensa", emoji: "🌧️" },
  71: { text: "Nevada ligera", emoji: "🌨️" },
  73: { text: "Nevada", emoji: "🌨️" },
  75: { text: "Nevada intensa", emoji: "❄️" },
  77: { text: "Granos de nieve", emoji: "❄️" },
  80: { text: "Chubascos ligeros", emoji: "🌦️" },
  81: { text: "Chubascos", emoji: "🌧️" },
  82: { text: "Chubascos violentos", emoji: "⛈️" },
  85: { text: "Chubascos de nieve", emoji: "🌨️" },
  86: { text: "Chubascos de nieve intensos", emoji: "❄️" },
  95: { text: "Tormenta", emoji: "⛈️" },
  96: { text: "Tormenta con granizo", emoji: "⛈️" },
  99: { text: "Tormenta con granizo intenso", emoji: "⛈️" },
};

export const UNKNOWN: WeatherCondition = { text: "Sin datos", emoji: "❔" };

export const CONFIG_DIR = "~/.config/weather-cli";
export const CONFIG_FILE = "~/.config/weather-cli/config.json";
export const CITIES_FILE = "~/.config/weather-cli/cities.json";
export const SETTINGS_FILE = "~/.config/weather-cli/settings.json";
