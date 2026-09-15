import type { City } from "./City.ts";

export interface CityWeather extends City {
  temperature: number;
  unit: string;
}

export interface DailyForecast {
  date: string;
  min: number;
  max: number;
  code: number;
}

export interface WeatherCondition {
  text: string;
  emoji: string;
}
