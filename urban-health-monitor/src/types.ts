// ──────────────────────────────────────────────
// Urban Health Monitoring System – Core Types
// ──────────────────────────────────────────────

/** Canonical location identifiers for the four monitoring stations. */
export type LocationId =
  | 'bagalur-cross'
  | 'phoenix-mall'
  | 'galleria-mall'
  | 'hebbal-flyover';

/** Scenario presets available in the demo. */
export type Scenario = 'baseline' | 'rush-hour' | 'improved';

/** Selectable overlay layers on the map view. */
export type MapLayer = 'aqi' | 'noise' | 'pm25' | 'pm10' | 'traffic' | 'stress';

/** Selectable metrics for the trend chart. */
export type TrendMetric = 'aqi' | 'noise' | 'pm25' | 'pm10' | 'waitingTime' | 'stress';

/** Indian AQI category labels. */
export type AqiCategory =
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe';

/** Three-level band used for noise, PM, traffic and stress. */
export type BandCategory = 'Low' | 'Elevated' | 'High';

/** Sort keys for the comparison table. */
export type ComparisonSortKey = 'aqi' | 'noise' | 'stress' | 'default';

// ── Geometry ────────────────────────────────────

/** 2-D position on the schematic map (px). */
export interface Position {
  x: number;
  y: number;
}

// ── Location metadata ───────────────────────────

export interface Location {
  id: LocationId;
  name: string;
  stationLabel: string;
  type: string;
  position: Position;
  context: string;
}

// ── Sensor reading ──────────────────────────────

export interface Reading {
  locationId: LocationId;
  timestamp: string; // ISO 8601
  source: 'simulated';
  scenario: Scenario;
  aqi: number;
  pm25UgM3: number;
  pm10UgM3: number;
  coMgM3: number;
  noiseLAeqDbA: number;
  splDbA: number;
  lmaxDbA: number;
  l10DbA: number;
  l90DbA: number;
  honksPerMinute: number;
  vehicleCountOneMinute: number;
  meanSpeedKmh: number;
  queueLengthMetres: number;
  waitingTimeSeconds: number;
  temperatureC: number;
  humidityPercent: number;
}

// ── Derived analytics ───────────────────────────

export interface ComponentScores {
  airScore: number;
  noiseScore: number;
  waitScore: number;
  queueScore: number;
  trafficScore: number;
}

export interface WeightedContributions {
  air: number;
  noise: number;
  traffic: number;
}

export interface DerivedReading {
  aqiCategory: AqiCategory;
  urbanStressIndex: number;
  stressCategory: BandCategory;
  componentScores: ComponentScores;
  weightedContributions: WeightedContributions;
  alertReasons: string[];
}

// ── Application state ───────────────────────────

export interface AppState {
  selectedLocationId: LocationId;
  activeJamLocationId: LocationId;
  commuterCycle: number;
  activeMapLayer: MapLayer;
  activeTrendMetric: TrendMetric;
  scenario: Scenario;
  simulationStep: number;
  simulationTimestamp: string;
  isPlaying: boolean;
  readingsByLocation: Record<LocationId, Reading>;
  historyByLocation: Record<LocationId, Reading[]>;
  comparisonSort: ComparisonSortKey;
}

// ── Actions ─────────────────────────────────────

export type AppAction =
  | { type: 'SELECT_LOCATION'; locationId: LocationId }
  | { type: 'SET_JAM_LOCATION'; locationId: LocationId }
  | { type: 'NEXT_COMMUTE_CYCLE' }
  | { type: 'SET_MAP_LAYER'; layer: MapLayer }
  | { type: 'SET_TREND_METRIC'; metric: TrendMetric }
  | { type: 'SET_SCENARIO'; scenario: Scenario }
  | { type: 'TICK' }
  | { type: 'STEP' }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'RESET' }
  | { type: 'SET_COMPARISON_SORT'; sortKey: ComparisonSortKey };
