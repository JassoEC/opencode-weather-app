import { loadConfig, saveConfig, type Config } from "./src/config.ts";
import {
  cityLabel,
  dailyFor,
  findCity,
  formatTemperature,
  sameCityName,
  searchCity,
  unitSymbol,
  weatherFor,
  weatherForAll,
  weekdayLabel,
} from "./src/weather.ts";
import { describeWeather } from "./src/codes.ts";
import {
  blank,
  fail,
  hint,
  info,
  renderMenu,
  success,
  warn,
  withSpinner,
} from "./src/ui.ts";
import { cyan, dim, pad, yellow } from "./src/theme.ts";

function ask(message: string): string {
  const value = prompt(message);
  return (value ?? "").trim();
}

function pause(): void {
  ask(cyan("   Presiona Enter para continuar..."));
}

async function showDefault(config: Config): Promise<void> {
  if (!config.defaultCity) {
    warn("No hay ciudad default. Usa la opción 5 para establecerla.");
    return pause();
  }
  const city = findCity(config, config.defaultCity);
  if (!city) {
    warn("La ciudad default ya no está registrada.");
    return pause();
  }
  const w = await withSpinner("Consultando el clima...", weatherFor(city, config.unit));
  blank();
  info(cyan(`📍 ${cityLabel(w)}`));
  info(`Temperatura: ${yellow(`${formatTemperature(w.temperature)}${w.unit}`)}`);
  pause();
}

async function showAll(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    warn("No hay ciudades registradas. Usa la opción 3 para agregar.");
    return pause();
  }
  const list = await withSpinner(
    "Consultando el clima...",
    weatherForAll(config.cities, config.unit),
  );
  blank();
  const width = Math.max(...list.map((c) => c.name.length));
  for (const c of list) {
    const isDefault = sameCityName(c.name, config.defaultCity ?? "");
    const star = isDefault ? ` ${yellow("*")}` : "  ";
    const nameCell = cyan(pad(c.name, width));
    const tempCell = yellow(`${formatTemperature(c.temperature)}${c.unit}`);
    info(`${star}${nameCell}  ${tempCell}`);
  }
  pause();
}

async function showForecast(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    warn("No hay ciudades. Agrega una primero (opción 3).");
    return pause();
  }
  const idx = pickIndex(config, "   Número de la ciudad: ");
  if (idx === null) return;
  const city = config.cities[idx];
  if (!city) return;

  const sym = unitSymbol(config.unit);
  const fmt = (v: number): string =>
    Number.isFinite(v) ? `${formatTemperature(v)}${sym}` : "—";

  const days = await withSpinner(
    "Cargando pronóstico...",
    dailyFor(city, config.unit),
  );
  blank();
  info(cyan(`📍 ${cityLabel(city)}`));
  info(dim(`${pad("Día", 13)}${pad("Mín", 8)}${pad("Máx", 8)}Condición`));
  info(dim("   " + "─".repeat(46)));
  for (const d of days) {
    const c = describeWeather(d.code);
    const line =
      pad(weekdayLabel(d.date), 13) +
      cyan(pad(fmt(d.min), 8)) +
      yellow(pad(fmt(d.max), 8)) +
      `${c.emoji} ${c.text}`;
    info(line);
  }
  pause();
}

async function addCity(config: Config): Promise<void> {
  const query = ask(cyan("   Nombre de la ciudad a buscar: "));
  if (!query) {
    warn("Búsqueda vacía, se canceló.");
    return pause();
  }
  const city = await withSpinner("Buscando ciudad...", searchCity(query));
  if (findCity(config, city.name)) {
    warn(`"${city.name}" ya está registrada.`);
    return pause();
  }
  config.cities.push(city);
  const isFirst = config.defaultCity === null;
  if (isFirst) config.defaultCity = city.name;
  saveConfig(config);
  success(`Agregada: ${cityLabel(city)}`);
  if (isFirst) hint("Ahora es la ciudad default.");
  pause();
}

function listChoices(config: Config): void {
  config.cities.forEach((c, i) => {
    const isDefault = sameCityName(c.name, config.defaultCity ?? "");
    const mark = isDefault ? yellow("*") : " ";
    info(`${mark} ${cyan(`${i + 1}.`)} ${c.name}`);
  });
}

function pickIndex(config: Config, message: string): number | null {
  listChoices(config);
  const raw = ask(cyan(message));
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > config.cities.length) {
    warn("Opción no válida.");
    return null;
  }
  return n - 1;
}

function removeCity(config: Config): void {
  if (config.cities.length === 0) {
    warn("No hay ciudades para eliminar.");
    return pause();
  }
  const idx = pickIndex(config, "   Número de ciudad a eliminar: ");
  if (idx === null) return;
  const [removed] = config.cities.splice(idx, 1);
  if (removed && config.defaultCity && sameCityName(config.defaultCity, removed.name)) {
    config.defaultCity = null;
  }
  saveConfig(config);
  if (removed) success(`Eliminada: ${removed.name}`);
  pause();
}

function setDefault(config: Config): void {
  if (config.cities.length === 0) {
    warn("No hay ciudades. Agrega una primero (opción 3).");
    return pause();
  }
  const idx = pickIndex(config, "   Número de la ciudad default: ");
  if (idx === null) return;
  const city = config.cities[idx];
  if (!city) return;
  config.defaultCity = city.name;
  saveConfig(config);
  success(`Ciudad default: ${city.name}`);
  pause();
}

function toggleUnit(config: Config): void {
  config.unit = config.unit === "celsius" ? "fahrenheit" : "celsius";
  saveConfig(config);
  success(`Unidad cambiada a ${unitSymbol(config.unit)}`);
  pause();
}

async function main(): Promise<void> {
  const config = loadConfig();
  let running = true;

  while (running) {
    renderMenu(config);
    const option = ask(cyan("   Selecciona una opción: "));
    blank();
    try {
      switch (option) {
        case "1":
          await showDefault(config);
          break;
        case "2":
          await showAll(config);
          break;
        case "3":
          await addCity(config);
          break;
        case "4":
          removeCity(config);
          break;
        case "5":
          setDefault(config);
          break;
        case "6":
          await showForecast(config);
          break;
        case "8":
          toggleUnit(config);
          break;
        case "9":
          running = false;
          blank();
          info(cyan("¡Hasta pronto! ☀"));
          break;
        case "":
          break;
        default:
          warn(`Opción no reconocida: "${option}".`);
      }
    } catch (error) {
      fail(error instanceof Error ? error.message : "Error inesperado.");
      pause();
    }
  }
}

void main();
