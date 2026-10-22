// ──────────────────────────────────────────────
// Urban Health Monitoring System – Baseline Data
// ──────────────────────────────────────────────

import { Reading, LocationId } from '../types';

/** Simulation epoch – 09:00 IST on demo day. */
export const BASE_TIMESTAMP = '2026-10-21T09:00:00+05:30';

/**
 * Baseline snapshot values ordered by severity:
 * 1) Bagalur Cross (Worst overall: Severe AQI, High Noise, Long Queues)
 * 2) Near Galleria Mall (Second worst: Elevated AQI, Congested)
 * 3) Phoenix Mall of Asia (Moderate environmental load)
 * 4) Hebbal Flyover entry (Cleanest / Best conditions)
 */
export const BASELINE_READINGS: Record<
  LocationId,
  Omit<Reading, 'locationId' | 'timestamp' | 'source' | 'scenario'>
> = {
  // Rank 1 (Worst)
  'bagalur-cross': {
    aqi: 248,
    pm25UgM3: 104,
    pm10UgM3: 215,
    coMgM3: 1.8,
    noiseLAeqDbA: 82.5,
    splDbA: 83.5,
    lmaxDbA: 92,
    l10DbA: 86,
    l90DbA: 76,
    honksPerMinute: 18,
    vehicleCountOneMinute: 68,
    meanSpeedKmh: 12,
    queueLengthMetres: 220,
    waitingTimeSeconds: 160,
    temperatureC: 32,
    humidityPercent: 55,
  },
  // Rank 2
  'galleria-mall': {
    aqi: 185,
    pm25UgM3: 78,
    pm10UgM3: 145,
    coMgM3: 1.2,
    noiseLAeqDbA: 76.5,
    splDbA: 77.5,
    lmaxDbA: 86,
    l10DbA: 80,
    l90DbA: 70,
    honksPerMinute: 12,
    vehicleCountOneMinute: 52,
    meanSpeedKmh: 18,
    queueLengthMetres: 140,
    waitingTimeSeconds: 110,
    temperatureC: 31,
    humidityPercent: 58,
  },
  // Rank 3
  'phoenix-mall': {
    aqi: 135,
    pm25UgM3: 68,
    pm10UgM3: 120,
    coMgM3: 0.9,
    noiseLAeqDbA: 70.0,
    splDbA: 71.5,
    lmaxDbA: 80,
    l10DbA: 74,
    l90DbA: 64,
    honksPerMinute: 9,
    vehicleCountOneMinute: 40,
    meanSpeedKmh: 22,
    queueLengthMetres: 95,
    waitingTimeSeconds: 75,
    temperatureC: 30,
    humidityPercent: 60,
  },
  // Rank 4 (Cleanest / Best)
  'hebbal-flyover': {
    aqi: 78,
    pm25UgM3: 35,
    pm10UgM3: 60,
    coMgM3: 0.5,
    noiseLAeqDbA: 62.0,
    splDbA: 63.5,
    lmaxDbA: 72,
    l10DbA: 66,
    l90DbA: 56,
    honksPerMinute: 4,
    vehicleCountOneMinute: 26,
    meanSpeedKmh: 32,
    queueLengthMetres: 45,
    waitingTimeSeconds: 35,
    temperatureC: 28,
    humidityPercent: 65,
  },
};
