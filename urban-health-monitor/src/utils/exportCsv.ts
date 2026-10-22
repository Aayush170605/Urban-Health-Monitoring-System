// ──────────────────────────────────────────────
// Urban Health Monitoring System – CSV Export
// ──────────────────────────────────────────────

import { Reading, Scenario, LocationId } from '../types';
import { LOCATION_MAP } from '../data/locations';
import { computeDerivedReading, getAqiCategory } from './analytics';
import { formatScenarioName } from './formatting';

// ── Helpers ─────────────────────────────────────

/**
 * Escape a CSV field: if it contains a comma, quote, or newline,
 * wrap in double quotes and double any embedded quotes.
 */
function csvField(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ── Column definitions ──────────────────────────

const HEADERS = [
  'Location',
  'Station Label',
  'Scenario',
  'Timestamp',
  'Source',
  'AQI',
  'AQI Category',
  'PM2.5 (µg/m³)',
  'PM10 (µg/m³)',
  'CO (mg/m³)',
  'Noise LAeq (dB(A))',
  'SPL (dB(A))',
  'Lmax (dB(A))',
  'L10 (dB(A))',
  'L90 (dB(A))',
  'Honks (events/min)',
  'Vehicle Count',
  'Mean Speed (km/h)',
  'Queue Length (m)',
  'Waiting Time (s)',
  'Temperature (°C)',
  'Humidity (%)',
  'Urban Stress Index',
  'Stress Category',
  'Alert Reasons',
];

// ── Row builder ─────────────────────────────────

function readingToRow(reading: Reading): string[] {
  const loc = LOCATION_MAP[reading.locationId];
  const derived = computeDerivedReading(reading);

  return [
    loc.name,
    loc.stationLabel,
    formatScenarioName(reading.scenario),
    reading.timestamp,
    reading.source,
    String(Math.round(reading.aqi)),
    getAqiCategory(reading.aqi),
    String(reading.pm25UgM3),
    String(reading.pm10UgM3),
    String(reading.coMgM3),
    String(reading.noiseLAeqDbA),
    String(reading.splDbA),
    String(reading.lmaxDbA),
    String(reading.l10DbA),
    String(reading.l90DbA),
    String(reading.honksPerMinute),
    String(reading.vehicleCountOneMinute),
    String(reading.meanSpeedKmh),
    String(reading.queueLengthMetres),
    String(reading.waitingTimeSeconds),
    String(reading.temperatureC),
    String(reading.humidityPercent),
    String(derived.urbanStressIndex),
    derived.stressCategory,
    derived.alertReasons.join('; '),
  ];
}

// ── Public API ──────────────────────────────────

/**
 * Generate a CSV string from the current set of readings (all 4 locations).
 */
export function generateCsv(
  readings: Record<LocationId, Reading>,
): string {
  const headerLine = HEADERS.map(csvField).join(',');
  const locationOrder: LocationId[] = [
    'bagalur-cross',
    'galleria-mall',
    'phoenix-mall',
    'hebbal-flyover',
  ];

  const rows = locationOrder.map((locId) => {
    const row = readingToRow(readings[locId]);
    return row.map(csvField).join(',');
  });

  return [headerLine, ...rows].join('\n');
}

/**
 * Build a filename for the CSV export.
 * Format: uhms-demo-[scenario]-[timestamp].csv
 */
export function buildCsvFilename(scenario: Scenario, timestamp: string): string {
  // Sanitise the timestamp for a filename: replace colons and plus signs
  const ts = timestamp
    .replace(/[:.]/g, '-')
    .replace(/\+/g, 'p')
    .replace(/T/g, '_');
  return `uhms-demo-${scenario}-${ts}.csv`;
}

/**
 * Trigger a browser download of the CSV content.
 */
export function downloadCsv(
  readings: Record<LocationId, Reading>,
  scenario: Scenario,
  timestamp: string,
): void {
  const csv = generateCsv(readings);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = buildCsvFilename(scenario, timestamp);
  a.style.display = 'none';

  document.body.appendChild(a);
  a.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
