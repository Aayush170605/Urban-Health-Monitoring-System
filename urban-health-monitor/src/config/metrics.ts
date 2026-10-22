// ──────────────────────────────────────────────
// Urban Health Monitoring System – Metrics Config
// ──────────────────────────────────────────────

import { MapLayer, TrendMetric, Reading } from '../types';

// ── Metric configuration ────────────────────────

export interface MetricConfig {
  key: string;
  label: string;
  shortLabel: string;
  unit: string;
  decimals: number;
  /** Extract the raw numeric value from a Reading. */
  accessor: (r: Reading) => number;
  /** Format a numeric value for display. */
  format: (v: number) => string;
}

/** Helper to build a formatter with fixed decimals + unit suffix. */
function fmt(decimals: number, unit: string) {
  return (v: number): string => {
    if (v == null || Number.isNaN(v)) return '—';
    return `${v.toFixed(decimals)} ${unit}`.trim();
  };
}

// ── Map layer configs ───────────────────────────

export const MAP_LAYER_CONFIGS: Record<MapLayer, MetricConfig> = {
  aqi: {
    key: 'aqi',
    label: 'Air Quality Index',
    shortLabel: 'AQI',
    unit: '',
    decimals: 0,
    accessor: (r) => r.aqi,
    format: fmt(0, ''),
  },
  noise: {
    key: 'noise',
    label: 'Noise Level (LAeq)',
    shortLabel: 'Noise',
    unit: 'dB(A)',
    decimals: 1,
    accessor: (r) => r.noiseLAeqDbA,
    format: fmt(1, 'dB(A)'),
  },
  pm25: {
    key: 'pm25',
    label: 'PM2.5',
    shortLabel: 'PM2.5',
    unit: 'µg/m³',
    decimals: 1,
    accessor: (r) => r.pm25UgM3,
    format: fmt(1, 'µg/m³'),
  },
  pm10: {
    key: 'pm10',
    label: 'PM10',
    shortLabel: 'PM10',
    unit: 'µg/m³',
    decimals: 1,
    accessor: (r) => r.pm10UgM3,
    format: fmt(1, 'µg/m³'),
  },
  traffic: {
    key: 'traffic',
    label: 'Queue Length',
    shortLabel: 'Queue',
    unit: 'm',
    decimals: 0,
    accessor: (r) => r.queueLengthMetres,
    format: fmt(0, 'm'),
  },
  stress: {
    key: 'stress',
    label: 'Urban Stress Index',
    shortLabel: 'Stress',
    unit: '',
    decimals: 0,
    accessor: (_r) => 0, // stress is derived, not on the Reading directly
    format: fmt(0, ''),
  },
};

// ── Trend metric configs ────────────────────────

export const TREND_METRIC_CONFIGS: Record<TrendMetric, MetricConfig> = {
  aqi: {
    key: 'aqi',
    label: 'Air Quality Index',
    shortLabel: 'AQI',
    unit: '',
    decimals: 0,
    accessor: (r) => r.aqi,
    format: fmt(0, ''),
  },
  noise: {
    key: 'noise',
    label: 'Noise Level (LAeq)',
    shortLabel: 'Noise',
    unit: 'dB(A)',
    decimals: 1,
    accessor: (r) => r.noiseLAeqDbA,
    format: fmt(1, 'dB(A)'),
  },
  pm25: {
    key: 'pm25',
    label: 'PM2.5',
    shortLabel: 'PM2.5',
    unit: 'µg/m³',
    decimals: 1,
    accessor: (r) => r.pm25UgM3,
    format: fmt(1, 'µg/m³'),
  },
  pm10: {
    key: 'pm10',
    label: 'PM10',
    shortLabel: 'PM10',
    unit: 'µg/m³',
    decimals: 1,
    accessor: (r) => r.pm10UgM3,
    format: fmt(1, 'µg/m³'),
  },
  waitingTime: {
    key: 'waitingTime',
    label: 'Waiting Time',
    shortLabel: 'Wait',
    unit: 's',
    decimals: 0,
    accessor: (r) => r.waitingTimeSeconds,
    format: fmt(0, 's'),
  },
  stress: {
    key: 'stress',
    label: 'Urban Stress Index',
    shortLabel: 'Stress',
    unit: '',
    decimals: 0,
    accessor: (_r) => 0, // derived field
    format: fmt(0, ''),
  },
};

// ── Selector lists for UI dropdowns ─────────────

export const MAP_LAYER_OPTIONS: { value: MapLayer; label: string }[] = [
  { value: 'aqi', label: 'Air Quality Index' },
  { value: 'noise', label: 'Noise Level' },
  { value: 'pm25', label: 'PM2.5' },
  { value: 'pm10', label: 'PM10' },
  { value: 'traffic', label: 'Queue / Traffic' },
  { value: 'stress', label: 'Stress Index' },
];

export const TREND_METRIC_OPTIONS: { value: TrendMetric; label: string }[] = [
  { value: 'aqi', label: 'AQI' },
  { value: 'noise', label: 'Noise LAeq' },
  { value: 'pm25', label: 'PM2.5' },
  { value: 'pm10', label: 'PM10' },
  { value: 'waitingTime', label: 'Waiting Time' },
  { value: 'stress', label: 'Stress Index' },
];
