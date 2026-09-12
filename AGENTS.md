# AGENTS.md

## Project

Weather CLI app. Asks for a city, fetches current temperature via Open-Meteo (two-step: geocoding → forecast).

## Runtime & Toolchain

- **Runtime:** Bun (not Node). Run with `bun run index.ts`.
- **Language:** TypeScript strict mode, ESM (`"type": "module"` in package.json).
- **Package manager:** Bun (`bun.lock` present). Install deps with `bun install`.

## API Flow

1. Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=1&language=es&format=json`
2. Forecast: `https://api.open-meteo.com/v1/forecast?latitude=<lat>&longitude=<lon>&current=temperature_2m`

No API key required.

## CLI Features (planned)

- Default city, register/delete cities, temperature unit toggle (°C/°F).
- Interactive menu-driven interface (see README for mockup).
- Generates a standalone binary (`bun build`).

## Conventions

- No linter or formatter configured. TypeScript strict mode is the main guard.
- No tests yet.
- Project language: Spanish (README, menu, city names).
