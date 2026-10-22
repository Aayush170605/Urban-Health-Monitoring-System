// ──────────────────────────────────────────────
// Urban Health Monitoring System – Formatting Utils
// ──────────────────────────────────────────────

import { Scenario } from '../types';

// ── Timestamp formatting ────────────────────────

/**
 * Parse an ISO timestamp and return a Date.
 * Handles the +05:30 offset explicitly.
 */
function parseISO(iso: string): Date {
  return new Date(iso);
}

/**
 * Format an ISO timestamp as "HH:MM IST".
 *
 * We work in IST (UTC+05:30) by extracting hours/minutes
 * from the raw offset arithmetic, ensuring consistency
 * regardless of the user's system timezone.
 */
export function formatTimestamp(iso: string): string {
  const d = parseISO(iso);
  // IST = UTC + 5:30
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60_000;
  const istMs = utcMs + 5.5 * 3600_000;
  const ist = new Date(istMs);
  const hh = String(ist.getHours()).padStart(2, '0');
  const mm = String(ist.getMinutes()).padStart(2, '0');
  return `${hh}:${mm} IST`;
}

/**
 * Short time format "HH:MM" (IST).
 */
export function formatTime(iso: string): string {
  const d = parseISO(iso);
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60_000;
  const istMs = utcMs + 5.5 * 3600_000;
  const ist = new Date(istMs);
  const hh = String(ist.getHours()).padStart(2, '0');
  const mm = String(ist.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Date format "DD Mon YYYY" (IST).
 */
export function formatDate(iso: string): string {
  const d = parseISO(iso);
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60_000;
  const istMs = utcMs + 5.5 * 3600_000;
  const ist = new Date(istMs);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const dd = String(ist.getDate()).padStart(2, '0');
  const mon = months[ist.getMonth()];
  const yyyy = ist.getFullYear();
  return `${dd} ${mon} ${yyyy}`;
}

// ── Value formatting ────────────────────────────

/**
 * Format a numeric value for display, returning '—' for
 * null, undefined, or NaN.
 */
export function formatValue(
  value: number | null | undefined,
  decimals: number = 1,
): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toFixed(decimals);
}

// ── Scenario name ───────────────────────────────

const SCENARIO_LABELS: Record<Scenario, string> = {
  baseline: 'Baseline',
  'rush-hour': 'Rush hour',
  improved: 'Improved conditions',
};

/**
 * Human-readable name for a scenario key.
 */
export function formatScenarioName(scenario: Scenario): string {
  return SCENARIO_LABELS[scenario] ?? scenario;
}
