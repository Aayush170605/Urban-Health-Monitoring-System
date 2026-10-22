// ──────────────────────────────────────────────
// Urban Health Monitoring System – Scenario Transforms
// ──────────────────────────────────────────────

import { Reading, LocationId, Scenario } from '../types';
import { BASELINE_READINGS, BASELINE_READINGS_BY_JAM } from './baseline';

// ── Helpers ─────────────────────────────────────

/** Clamp a number between lo and hi (inclusive). */
function clamp(value: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, value));
}

/** Round to a given number of decimal places. */
function round(value: number, decimals = 1): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

// ── Scenario transformers ───────────────────────

type RawFields = Omit<Reading, 'locationId' | 'timestamp' | 'source' | 'scenario'>;

/**
 * Apply rush-hour multipliers to a baseline snapshot.
 *
 * Multipliers (from brief):
 * - AQI ×1.30 capped at 500
 * - PM2.5 / PM10 ×1.30
 * - CO ×1.20
 * - Noise LAeq +5 dB (all noise stats shifted +5)
 * - Vehicles ×1.20
 * - Speed ×0.65
 * - Queue / Waiting ×1.35
 * - Honks ×1.50
 * - Temperature / Humidity unchanged
 */
function applyRushHour(base: RawFields): RawFields {
  const noiseDelta = 5;
  return {
    aqi: clamp(round(base.aqi * 1.3, 0), 0, 500),
    pm25UgM3: round(base.pm25UgM3 * 1.3),
    pm10UgM3: round(base.pm10UgM3 * 1.3),
    coMgM3: round(base.coMgM3 * 1.2, 2),
    noiseLAeqDbA: round(base.noiseLAeqDbA + noiseDelta),
    splDbA: round(base.splDbA + noiseDelta),
    lmaxDbA: round(base.lmaxDbA + noiseDelta),
    l10DbA: round(base.l10DbA + noiseDelta),
    l90DbA: round(base.l90DbA + noiseDelta),
    honksPerMinute: round(base.honksPerMinute * 1.5),
    vehicleCountOneMinute: round(base.vehicleCountOneMinute * 1.2, 0),
    meanSpeedKmh: round(base.meanSpeedKmh * 0.65),
    queueLengthMetres: round(base.queueLengthMetres * 1.35),
    waitingTimeSeconds: round(base.waitingTimeSeconds * 1.35),
    temperatureC: base.temperatureC,
    humidityPercent: base.humidityPercent,
  };
}

/**
 * Apply improved-conditions multipliers to a baseline snapshot.
 *
 * Multipliers (from brief):
 * - AQI ×0.65
 * - PM2.5 / PM10 ×0.65
 * - CO ×0.70
 * - Noise LAeq −8 dB (all noise stats shifted −8)
 * - Vehicles ×0.85
 * - Speed +10 km/h
 * - Queue / Waiting ×0.55
 * - Honks ×0.50
 * - Temperature / Humidity unchanged
 */
function applyImproved(base: RawFields): RawFields {
  const noiseDelta = -8;
  return {
    aqi: clamp(round(base.aqi * 0.65, 0), 0, 500),
    pm25UgM3: round(base.pm25UgM3 * 0.65),
    pm10UgM3: round(base.pm10UgM3 * 0.65),
    coMgM3: round(base.coMgM3 * 0.7, 2),
    noiseLAeqDbA: round(base.noiseLAeqDbA + noiseDelta),
    splDbA: round(base.splDbA + noiseDelta),
    lmaxDbA: round(base.lmaxDbA + noiseDelta),
    l10DbA: round(base.l10DbA + noiseDelta),
    l90DbA: round(base.l90DbA + noiseDelta),
    honksPerMinute: round(base.honksPerMinute * 0.5),
    vehicleCountOneMinute: round(base.vehicleCountOneMinute * 0.85, 0),
    meanSpeedKmh: round(base.meanSpeedKmh + 10),
    queueLengthMetres: round(base.queueLengthMetres * 0.55),
    waitingTimeSeconds: round(base.waitingTimeSeconds * 0.55),
    temperatureC: base.temperatureC,
    humidityPercent: base.humidityPercent,
  };
}

// ── Post-processing constraints ─────────────────

/**
 * Enforce physical constraints on a raw reading:
 * - All numeric fields non-negative
 * - AQI clamped 0–500
 * - Humidity clamped 0–100
 * - PM10 >= PM2.5
 * - Lmax >= L10 >= L90
 * - Lmax >= SPL
 * - SPL reasonably close to LAeq
 */
function enforceConstraints(r: RawFields): RawFields {
  const out = { ...r };

  // Non-negative & ranges
  out.aqi = clamp(Math.round(out.aqi), 0, 500);
  out.pm25UgM3 = Math.max(0, out.pm25UgM3);
  out.pm10UgM3 = Math.max(0, out.pm10UgM3);
  out.coMgM3 = Math.max(0, out.coMgM3);
  out.honksPerMinute = Math.max(0, out.honksPerMinute);
  out.vehicleCountOneMinute = Math.max(0, Math.round(out.vehicleCountOneMinute));
  out.meanSpeedKmh = Math.max(0, out.meanSpeedKmh);
  out.queueLengthMetres = Math.max(0, out.queueLengthMetres);
  out.waitingTimeSeconds = Math.max(0, out.waitingTimeSeconds);
  out.temperatureC = Math.max(-10, out.temperatureC);
  out.humidityPercent = clamp(out.humidityPercent, 0, 100);

  // PM10 must be >= PM2.5
  if (out.pm10UgM3 < out.pm25UgM3) {
    out.pm10UgM3 = out.pm25UgM3;
  }

  // Noise ordering: Lmax >= L10 >= L90
  if (out.l10DbA > out.lmaxDbA) out.l10DbA = out.lmaxDbA;
  if (out.l90DbA > out.l10DbA) out.l90DbA = out.l10DbA;

  // SPL should not exceed Lmax
  if (out.splDbA > out.lmaxDbA) out.splDbA = out.lmaxDbA;

  // All noise values non-negative
  out.noiseLAeqDbA = Math.max(0, out.noiseLAeqDbA);
  out.splDbA = Math.max(0, out.splDbA);
  out.lmaxDbA = Math.max(0, out.lmaxDbA);
  out.l10DbA = Math.max(0, out.l10DbA);
  out.l90DbA = Math.max(0, out.l90DbA);

  return out;
}

// ── Public API ──────────────────────────────────

/**
 * Returns the scenario-adjusted anchor values for a given location.
 * Takes into account the currently active jammed location so real-time shifts
 * dynamically adjust which station experiences the severe bottleneck!
 */
export function applyScenario(
  locationId: LocationId,
  scenario: Scenario,
  jamLocationId: LocationId = 'bagalur-cross',
): RawFields {
  const dataset = BASELINE_READINGS_BY_JAM[jamLocationId] || BASELINE_READINGS;
  const base = dataset[locationId] || BASELINE_READINGS[locationId];

  switch (scenario) {
    case 'baseline':
      return enforceConstraints({ ...base });
    case 'rush-hour':
      return enforceConstraints(applyRushHour(base));
    case 'improved':
      return enforceConstraints(applyImproved(base));
    default:
      return enforceConstraints({ ...base });
  }
}

/**
 * Convenience: get the scenario anchor for every location.
 */
export function applyScenarioAll(
  scenario: Scenario,
  jamLocationId: LocationId = 'bagalur-cross',
): Record<LocationId, RawFields> {
  return {
    'bagalur-cross': applyScenario('bagalur-cross', scenario, jamLocationId),
    'galleria-mall': applyScenario('galleria-mall', scenario, jamLocationId),
    'phoenix-mall': applyScenario('phoenix-mall', scenario, jamLocationId),
    'hebbal-flyover': applyScenario('hebbal-flyover', scenario, jamLocationId),
  };
}

export { enforceConstraints };
export type { RawFields };
