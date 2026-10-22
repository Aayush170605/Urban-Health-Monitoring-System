// ──────────────────────────────────────────────
// Urban Health Monitoring System – Analytics
// ──────────────────────────────────────────────

import {
  AqiCategory,
  BandCategory,
  ComponentScores,
  DerivedReading,
  Reading,
  WeightedContributions,
} from '../types';
import {
  AQI_CATEGORIES,
  ALERT_THRESHOLDS,
  BAND_COLORS,
  BAND_LOOKUP,
  BandMetric,
} from '../config/thresholds';

// ── Helpers ─────────────────────────────────────

/** Clamp x to [0, 1]. */
function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

// ── AQI classification ─────────────────────────

/**
 * Map a numeric AQI value to an Indian-NAQI category label.
 * Values above 500 fall into 'Severe'; values below 0 are 'Good'.
 */
export function getAqiCategory(aqi: number): AqiCategory {
  const clamped = Math.round(aqi);
  for (const cat of AQI_CATEGORIES) {
    if (clamped >= cat.min && clamped <= cat.max) {
      return cat.label;
    }
  }
  // Fallback for out-of-range values
  return clamped <= 0 ? 'Good' : 'Severe';
}

/**
 * Return the colour hex string associated with a numeric AQI value.
 */
export function getAqiColor(aqi: number): string {
  const clamped = Math.round(aqi);
  for (const cat of AQI_CATEGORIES) {
    if (clamped >= cat.min && clamped <= cat.max) {
      return cat.color;
    }
  }
  return clamped <= 0 ? AQI_CATEGORIES[0].color : AQI_CATEGORIES[AQI_CATEGORIES.length - 1].color;
}

/**
 * Return the text colour (for legibility on the AQI badge background).
 */
export function getAqiTextColor(aqi: number): string {
  const clamped = Math.round(aqi);
  for (const cat of AQI_CATEGORIES) {
    if (clamped >= cat.min && clamped <= cat.max) {
      return cat.textColor;
    }
  }
  return '#fff';
}

// ── Band classification ─────────────────────────

/**
 * Classify a value into Low / Elevated / High for a given metric.
 */
export function getBandCategory(value: number, metric: BandMetric): BandCategory {
  const bands = BAND_LOOKUP[metric];
  for (const band of bands) {
    if (value >= band.min && value < band.max) {
      return band.label;
    }
  }
  // Fallback
  return 'High';
}

/**
 * Return the hex colour for a band category.
 */
export function getBandColor(category: BandCategory): string {
  return BAND_COLORS[category];
}

// ── Urban Stress Index ──────────────────────────

/**
 * Compute the Urban Stress Index and its component scores.
 *
 * Formula:
 *   airScore      = 100 × clamp01(AQI / 300)
 *   noiseScore    = 100 × clamp01((LAeq − 45) / (90 − 45))
 *   waitScore     = 100 × clamp01(waitingTime / 180)
 *   queueScore    = 100 × clamp01(queueLength / 300)
 *   trafficScore  = 0.60 × waitScore + 0.40 × queueScore
 *   USI           = round(0.45 × airScore + 0.35 × noiseScore + 0.20 × trafficScore)
 *
 * Verified baseline scores: Bagalur ≈ 60, Phoenix ≈ 51, Galleria ≈ 34, Hebbal ≈ 80
 */
export function computeUrbanStressIndex(reading: Reading): {
  index: number;
  category: BandCategory;
  componentScores: ComponentScores;
  weightedContributions: WeightedContributions;
} {
  const airScore = 100 * clamp01(reading.aqi / 300);
  const noiseScore = 100 * clamp01((reading.noiseLAeqDbA - 45) / (90 - 45));
  const waitScore = 100 * clamp01(reading.waitingTimeSeconds / 180);
  const queueScore = 100 * clamp01(reading.queueLengthMetres / 300);
  const trafficScore = 0.6 * waitScore + 0.4 * queueScore;

  const rawIndex = 0.45 * airScore + 0.35 * noiseScore + 0.2 * trafficScore;
  const index = Math.round(rawIndex);

  const category = getBandCategory(index, 'stress');

  const componentScores: ComponentScores = {
    airScore: Math.round(airScore * 10) / 10,
    noiseScore: Math.round(noiseScore * 10) / 10,
    waitScore: Math.round(waitScore * 10) / 10,
    queueScore: Math.round(queueScore * 10) / 10,
    trafficScore: Math.round(trafficScore * 10) / 10,
  };

  const weightedContributions: WeightedContributions = {
    air: Math.round(0.45 * airScore * 10) / 10,
    noise: Math.round(0.35 * noiseScore * 10) / 10,
    traffic: Math.round(0.2 * trafficScore * 10) / 10,
  };

  return { index, category, componentScores, weightedContributions };
}

// ── Alert reasons ───────────────────────────────

/**
 * Check alert-trigger thresholds and return an array of human-readable reasons.
 */
export function getAlertReasons(reading: Reading, stressIndex: number): string[] {
  const reasons: string[] = [];

  if (reading.aqi >= ALERT_THRESHOLDS.aqi) {
    reasons.push(`AQI ${Math.round(reading.aqi)} is in the Poor/Severe range (≥${ALERT_THRESHOLDS.aqi})`);
  }

  if (reading.noiseLAeqDbA >= ALERT_THRESHOLDS.noise) {
    reasons.push(
      `Noise LAeq ${reading.noiseLAeqDbA.toFixed(1)} dB(A) exceeds threshold (≥${ALERT_THRESHOLDS.noise})`,
    );
  }

  if (stressIndex >= ALERT_THRESHOLDS.stress) {
    reasons.push(`Urban Stress Index ${stressIndex} is High (≥${ALERT_THRESHOLDS.stress})`);
  }

  return reasons;
}

// ── Composite derived reading ───────────────────

/**
 * Compute all derived analytics for a sensor reading in one call.
 */
export function computeDerivedReading(reading: Reading): DerivedReading {
  const aqiCategory = getAqiCategory(reading.aqi);
  const { index, category, componentScores, weightedContributions } =
    computeUrbanStressIndex(reading);
  const alertReasons = getAlertReasons(reading, index);

  return {
    aqiCategory,
    urbanStressIndex: index,
    stressCategory: category,
    componentScores,
    weightedContributions,
    alertReasons,
  };
}
