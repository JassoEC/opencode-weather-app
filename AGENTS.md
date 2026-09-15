# AGENTS.md

## Project

Weather CLI app. Asks for a city, fetches current temperature via Open-Meteo (two-step: geocoding → forecast).

## Runtime & Toolchain

- **Runtime:** Bun (not Node). Run with `bun run src/index.ts`.
- **Language:** TypeScript strict mode, ESM (`"type": "module"` in package.json).
- **Package manager:** Bun (`bun.lock` present). Install deps with `bun install`.

## API Flow

1. Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=1&language=es&format=json`
2. Forecast: `https://api.open-meteo.com/v1/forecast?latitude=<lat>&longitude=<lon>&current=temperature_2m`

No API key required.

## CLI Features

- Default city, register/delete cities, temperature unit toggle (°C/°F).
- 7-day forecast per city.
- Interactive menu-driven interface (see README for mockup).
- Generates a standalone binary (`bun build`).

## Architecture (layered)

- `src/actions/`      — one action per file, `run(state: AppState)` signature; each persists via storage
- `src/presentation/` — menu.ts / output.ts / input.ts (console I/O only)
- `src/storage/`      — citiesStorage.ts, settingsStorage.ts, migrate.ts
- `src/api/`          — geocoding.ts, weather.ts (Open-Meteo)
- `src/types/`        — City.ts, Weather.ts, Settings.ts, MenuOption.ts
- `src/utils/`        — format.ts, constants.ts, colors.ts
- `src/index.ts`      — menu loop; dispatches from `OPTIONS: MenuOption[]` array

## Storage

- `~/.config/weather-cli/cities.json` + `settings.json`
- Migración automática desde `config.json` (se respalda como `.bak`) vía `src/storage/migrate.ts`

## Extending

- Nueva función = nuevo archivo en `src/actions/` + entrada en `OPTIONS` (`src/index.ts`)

## Conventions

- No linter or formatter configured. TypeScript strict mode is the main guard.
- No tests yet.
- Project language: Spanish (README, menu, city names).
