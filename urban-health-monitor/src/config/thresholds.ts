// ──────────────────────────────────────────────
// Urban Health Monitoring System – Thresholds & Colors
// ──────────────────────────────────────────────

import { AqiCategory, BandCategory } from '../types';

// ── AQI Categories (Indian NAQI) ────────────────

export interface AqiCategoryDef {
  min: number;
  max: number;
  label: AqiCategory;
  color: string;
  textColor: string;
}

/**
 * Indian AQI breakpoints.
 * Each range is inclusive on both ends; the first matching range wins.
 */
export const AQI_CATEGORIES: AqiCategoryDef[] = [
  { min: 0, max: 50, label: 'Good', color: '#4CAF50', textColor: '#fff' },
  { min: 51, max: 100, label: 'Satisfactory', color: '#8BC34A', textColor: '#fff' },
  { min: 101, max: 200, label: 'Moderate', color: '#FFC107', textColor: '#000' },
  { min: 201, max: 300, label: 'Poor', color: '#FF9800', textColor: '#000' },
  { min: 301, max: 400, label: 'Very Poor', color: '#F44336', textColor: '#fff' },
  { min: 401, max: 500, label: 'Severe', color: '#880E4F', textColor: '#fff' },
];

// ── Band definitions ────────────────────────────

export interface BandDef {
  label: BandCategory;
  min: number;
  max: number; // exclusive upper bound (Infinity for last)
  color: string;
}

/** Band colours shared by all three-level bands. */
export const BAND_COLORS: Record<BandCategory, string> = {
  Low: '#4CAF50',
  Elevated: '#FFC107',
  High: '#F44336',
};

/** Noise LAeq bands (dB(A)). */
export const NOISE_BANDS: BandDef[] = [
  { label: 'Low', min: 0, max: 65, color: BAND_COLORS.Low },
  { label: 'Elevated', min: 65, max: 80, color: BAND_COLORS.Elevated },
  { label: 'High', min: 80, max: Infinity, color: BAND_COLORS.High },
];

/** PM2.5 bands (µg/m³). */
export const PM25_BANDS: BandDef[] = [
  { label: 'Low', min: 0, max: 30.01, color: BAND_COLORS.Low },
  { label: 'Elevated', min: 30.01, max: 90.01, color: BAND_COLORS.Elevated },
  { label: 'High', min: 90.01, max: Infinity, color: BAND_COLORS.High },
];

/** PM10 bands (µg/m³). */
export const PM10_BANDS: BandDef[] = [
  { label: 'Low', min: 0, max: 50.01, color: BAND_COLORS.Low },
  { label: 'Elevated', min: 50.01, max: 150.01, color: BAND_COLORS.Elevated },
  { label: 'High', min: 150.01, max: Infinity, color: BAND_COLORS.High },
];

/** Traffic / queue-length bands (metres). */
export const TRAFFIC_BANDS: BandDef[] = [
  { label: 'Low', min: 0, max: 75.01, color: BAND_COLORS.Low },
  { label: 'Elevated', min: 75.01, max: 150.01, color: BAND_COLORS.Elevated },
  { label: 'High', min: 150.01, max: Infinity, color: BAND_COLORS.High },
];

/** Urban Stress Index bands (0–100). */
export const STRESS_BANDS: BandDef[] = [
  { label: 'Low', min: 0, max: 40, color: BAND_COLORS.Low },
  { label: 'Elevated', min: 40, max: 70, color: BAND_COLORS.Elevated },
  { label: 'High', min: 70, max: Infinity, color: BAND_COLORS.High },
];

// ── Alert trigger thresholds ────────────────────

export const ALERT_THRESHOLDS = {
  /** AQI >= this value triggers an alert. */
  aqi: 201,
  /** Noise LAeq >= this value (dB(A)) triggers an alert. */
  noise: 80,
  /** Urban Stress Index >= this value triggers an alert. */
  stress: 70,
} as const;

// ── Lookup helper mapping metric name → band array ─

export type BandMetric = 'noise' | 'pm25' | 'pm10' | 'traffic' | 'stress';

export const BAND_LOOKUP: Record<BandMetric, BandDef[]> = {
  noise: NOISE_BANDS,
  pm25: PM25_BANDS,
  pm10: PM10_BANDS,
  traffic: TRAFFIC_BANDS,
  stress: STRESS_BANDS,
};
