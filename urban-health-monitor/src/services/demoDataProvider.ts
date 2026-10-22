// ──────────────────────────────────────────────
// Urban Health Monitoring System – Demo Data Provider
// ──────────────────────────────────────────────
//
// Deterministic simulation engine that generates smoothly-varying
// sensor readings around the scenario anchor values.
//
// Each simulation step represents 5 simulated minutes.
// History is pre-filled with steps −12 through 0 (13 points = 60-minute window).

import { Reading, LocationId, Scenario } from '../types';
import { LOCATION_IDS } from '../data/locations';
import { applyScenario } from '../data/scenarios';
import { BASE_TIMESTAMP } from '../data/baseline';

// ── Deterministic per-location seeds ────────────

const LOCATION_SEEDS: Record<LocationId, number> = {
  'bagalur-cross': 1.0,
  'phoenix-mall': 2.3,
  'galleria-mall': 3.7,
  'hebbal-flyover': 5.1,
};

// Per-parameter seeds to decorrelate the oscillation of different fields
const PARAM_SEEDS: Record<string, number> = {
  aqi: 0.0,
  pm25UgM3: 0.5,
  pm10UgM3: 1.0,
  coMgM3: 1.5,
  noiseLAeqDbA: 2.0,
  splDbA: 2.2,
  lmaxDbA: 2.4,
  l10DbA: 2.6,
  l90DbA: 2.8,
  honksPerMinute: 3.0,
  vehicleCountOneMinute: 3.5,
  meanSpeedKmh: 4.0,
  queueLengthMetres: 4.5,
  waitingTimeSeconds: 5.0,
  temperatureC: 6.0,
  humidityPercent: 6.5,
};

// ── Variation amplitudes ────────────────────────
// Air/traffic fields: ±4% (multiplicative)
// Noise fields: ±1.5 dB (additive)
// Temperature: ±0.5 °C (additive)
// Humidity: ±2 % (additive)

interface VariationSpec {
  mode: 'mult' | 'add';
  amplitude: number;
}

const VARIATION: Record<string, VariationSpec> = {
  aqi: { mode: 'mult', amplitude: 0.04 },
  pm25UgM3: { mode: 'mult', amplitude: 0.04 },
  pm10UgM3: { mode: 'mult', amplitude: 0.04 },
  coMgM3: { mode: 'mult', amplitude: 0.04 },
  noiseLAeqDbA: { mode: 'add', amplitude: 1.5 },
  splDbA: { mode: 'add', amplitude: 1.5 },
  lmaxDbA: { mode: 'add', amplitude: 1.5 },
  l10DbA: { mode: 'add', amplitude: 1.5 },
  l90DbA: { mode: 'add', amplitude: 1.5 },
  honksPerMinute: { mode: 'mult', amplitude: 0.04 },
  vehicleCountOneMinute: { mode: 'mult', amplitude: 0.04 },
  meanSpeedKmh: { mode: 'mult', amplitude: 0.04 },
  queueLengthMetres: { mode: 'mult', amplitude: 0.04 },
  waitingTimeSeconds: { mode: 'mult', amplitude: 0.04 },
  temperatureC: { mode: 'add', amplitude: 0.5 },
  humidityPercent: { mode: 'add', amplitude: 2 },
};

// ── Core oscillation function ───────────────────

/**
 * Deterministic smooth variation using overlaid sine waves.
 * Returns a value in [-1, 1].
 */
function oscillation(step: number, locSeed: number, paramSeed: number): number {
  // Two overlaid sine waves with irrational-ish frequencies for organic feel
  const primary = Math.sin(step * 0.7 + locSeed + paramSeed);
  const secondary = 0.3 * Math.sin(step * 1.3 + locSeed * 1.7 + paramSeed * 0.9);
  // Normalise the sum to stay within [-1, 1] (max sum ≈ 1.3, scale to 1)
  return (primary + secondary) / 1.3;
}

/**
 * Apply variation to an anchor value for a given step.
 */
function vary(
  anchor: number,
  paramKey: string,
  step: number,
  locSeed: number,
): number {
  if (step === 0) return anchor; // Step 0 = exact anchor

  const spec = VARIATION[paramKey];
  if (!spec) return anchor;

  const osc = oscillation(step, locSeed, PARAM_SEEDS[paramKey] ?? 0);

  if (spec.mode === 'mult') {
    return anchor * (1 + spec.amplitude * osc);
  }
  // additive
  return anchor + spec.amplitude * osc;
}

// ── Timestamp computation ───────────────────────

/**
 * Compute the ISO timestamp for a given step offset from the base timestamp.
 * Each step = 5 simulated minutes.
 */
export function stepToTimestamp(step: number, baseTimestamp: string = BASE_TIMESTAMP): string {
  const base = new Date(baseTimestamp);
  const offsetMs = step * 5 * 60 * 1000;
  const d = new Date(base.getTime() + offsetMs);
  // Reproduce the +05:30 offset in the ISO string
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getUTCFullYear();

  // IST is UTC+5:30
  const istMs = d.getTime();
  const istDate = new Date(istMs);
  // We stored the base as +05:30, so the UTC time is already adjusted.
  // We need to reconstruct IST from the UTC time.
  const utcMs = istDate.getTime();
  const istOffsetMs = 5.5 * 3600_000;
  const ist = new Date(utcMs + istDate.getTimezoneOffset() * 60_000 + istOffsetMs);

  return (
    `${ist.getFullYear()}-${pad2(ist.getMonth() + 1)}-${pad2(ist.getDate())}` +
    `T${pad2(ist.getHours())}:${pad2(ist.getMinutes())}:${pad2(ist.getSeconds())}+05:30`
  );
}

// ── Constraint enforcement ──────────────────────

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function enforceReadingConstraints(r: Omit<Reading, 'locationId' | 'timestamp' | 'source' | 'scenario'>): typeof r {
  const out = { ...r };

  out.aqi = clamp(Math.round(out.aqi), 0, 500);
  out.pm25UgM3 = Math.max(0, Math.round(out.pm25UgM3 * 10) / 10);
  out.pm10UgM3 = Math.max(0, Math.round(out.pm10UgM3 * 10) / 10);
  out.coMgM3 = Math.max(0, Math.round(out.coMgM3 * 100) / 100);
  out.noiseLAeqDbA = Math.max(0, Math.round(out.noiseLAeqDbA * 10) / 10);
  out.splDbA = Math.max(0, Math.round(out.splDbA * 10) / 10);
  out.lmaxDbA = Math.max(0, Math.round(out.lmaxDbA * 10) / 10);
  out.l10DbA = Math.max(0, Math.round(out.l10DbA * 10) / 10);
  out.l90DbA = Math.max(0, Math.round(out.l90DbA * 10) / 10);
  out.honksPerMinute = Math.max(0, Math.round(out.honksPerMinute * 10) / 10);
  out.vehicleCountOneMinute = Math.max(0, Math.round(out.vehicleCountOneMinute));
  out.meanSpeedKmh = Math.max(0, Math.round(out.meanSpeedKmh * 10) / 10);
  out.queueLengthMetres = Math.max(0, Math.round(out.queueLengthMetres * 10) / 10);
  out.waitingTimeSeconds = Math.max(0, Math.round(out.waitingTimeSeconds * 10) / 10);
  out.temperatureC = Math.round(out.temperatureC * 10) / 10;
  out.humidityPercent = clamp(Math.round(out.humidityPercent * 10) / 10, 0, 100);

  // PM10 >= PM2.5
  if (out.pm10UgM3 < out.pm25UgM3) out.pm10UgM3 = out.pm25UgM3;

  // Noise ordering: Lmax >= L10 >= L90, and Lmax >= SPL
  if (out.l10DbA > out.lmaxDbA) out.l10DbA = out.lmaxDbA;
  if (out.l90DbA > out.l10DbA) out.l90DbA = out.l10DbA;
  if (out.splDbA > out.lmaxDbA) out.splDbA = out.lmaxDbA;

  return out;
}

// ── Public API ──────────────────────────────────

/**
 * Generate a single sensor reading for one location at a given step.
 *
 * @param locationId  Which station
 * @param scenario    Scenario preset
 * @param step        Simulation step (0 = anchor, negative = history)
 * @param baseTimestamp  Epoch ISO string
 */
export function generateReading(
  locationId: LocationId,
  scenario: Scenario,
  step: number,
  baseTimestamp: string = BASE_TIMESTAMP,
  jamLocationId: LocationId = 'bagalur-cross',
): Reading {
  const anchor = applyScenario(locationId, scenario, jamLocationId);
  const locSeed = LOCATION_SEEDS[locationId];
  const timestamp = stepToTimestamp(step, baseTimestamp);

  const varied = {
    aqi: vary(anchor.aqi, 'aqi', step, locSeed),
    pm25UgM3: vary(anchor.pm25UgM3, 'pm25UgM3', step, locSeed),
    pm10UgM3: vary(anchor.pm10UgM3, 'pm10UgM3', step, locSeed),
    coMgM3: vary(anchor.coMgM3, 'coMgM3', step, locSeed),
    noiseLAeqDbA: vary(anchor.noiseLAeqDbA, 'noiseLAeqDbA', step, locSeed),
    splDbA: vary(anchor.splDbA, 'splDbA', step, locSeed),
    lmaxDbA: vary(anchor.lmaxDbA, 'lmaxDbA', step, locSeed),
    l10DbA: vary(anchor.l10DbA, 'l10DbA', step, locSeed),
    l90DbA: vary(anchor.l90DbA, 'l90DbA', step, locSeed),
    honksPerMinute: vary(anchor.honksPerMinute, 'honksPerMinute', step, locSeed),
    vehicleCountOneMinute: vary(anchor.vehicleCountOneMinute, 'vehicleCountOneMinute', step, locSeed),
    meanSpeedKmh: vary(anchor.meanSpeedKmh, 'meanSpeedKmh', step, locSeed),
    queueLengthMetres: vary(anchor.queueLengthMetres, 'queueLengthMetres', step, locSeed),
    waitingTimeSeconds: vary(anchor.waitingTimeSeconds, 'waitingTimeSeconds', step, locSeed),
    temperatureC: vary(anchor.temperatureC, 'temperatureC', step, locSeed),
    humidityPercent: vary(anchor.humidityPercent, 'humidityPercent', step, locSeed),
  };

  const constrained = enforceReadingConstraints(varied);

  return {
    locationId,
    timestamp,
    source: 'simulated',
    scenario,
    ...constrained,
  };
}

/**
 * Generate readings for all 4 locations at a given step.
 */
export function generateAllReadings(
  scenario: Scenario,
  step: number,
  baseTimestamp: string = BASE_TIMESTAMP,
  jamLocationId: LocationId = 'bagalur-cross',
): Record<LocationId, Reading> {
  const result = {} as Record<LocationId, Reading>;
  for (const locId of LOCATION_IDS) {
    result[locId] = generateReading(locId, scenario, step, baseTimestamp, jamLocationId);
  }
  return result;
}

/**
 * Generate the 60-minute history window (steps −12 through currentStep)
 * yielding 13 data points per location.
 */
export function generateHistory(
  scenario: Scenario,
  currentStep: number,
  baseTimestamp: string = BASE_TIMESTAMP,
  jamLocationId: LocationId = 'bagalur-cross',
): Record<LocationId, Reading[]> {
  const result = {} as Record<LocationId, Reading[]>;
  for (const locId of LOCATION_IDS) {
    result[locId] = [];
  }

  const historyLength = 13; // 12 past + current
  const startStep = currentStep - historyLength + 1;

  for (let s = startStep; s <= currentStep; s++) {
    for (const locId of LOCATION_IDS) {
      result[locId].push(generateReading(locId, scenario, s, baseTimestamp, jamLocationId));
    }
  }

  return result;
}
