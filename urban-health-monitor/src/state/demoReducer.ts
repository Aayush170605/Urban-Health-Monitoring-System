// ──────────────────────────────────────────────
// Urban Health Monitoring System – Demo Reducer
// ──────────────────────────────────────────────

import { AppState, AppAction } from '../types';
import { BASE_TIMESTAMP } from '../data/baseline';
import {
  generateAllReadings,
  generateHistory,
  stepToTimestamp,
} from '../services/demoDataProvider';

// ── Defaults ────────────────────────────────────

/**
 * Build the initial application state.
 * Starts at baseline, step 0 (09:00 IST), paused, with Bagalur Cross (worst hotspot) selected.
 */
export function createInitialState(): AppState {
  const scenario = 'baseline' as const;
  const step = 0;

  return {
    selectedLocationId: 'bagalur-cross',
    activeMapLayer: 'aqi',
    activeTrendMetric: 'aqi',
    scenario,
    simulationStep: step,
    simulationTimestamp: stepToTimestamp(step),
    isPlaying: false,
    readingsByLocation: generateAllReadings(scenario, step),
    historyByLocation: generateHistory(scenario, step),
    comparisonSort: 'default',
  };
}

// ── History helper ──────────────────────────────

/**
 * Append new readings to each location's history and keep only the latest 13 entries.
 */
function appendHistory(
  prev: AppState['historyByLocation'],
  newReadings: AppState['readingsByLocation'],
): AppState['historyByLocation'] {
  const result = { ...prev };
  for (const locId of Object.keys(newReadings) as Array<keyof typeof newReadings>) {
    const arr = [...(prev[locId] || []), newReadings[locId]];
    // Keep latest 13 entries (60-minute window at 5-min intervals)
    result[locId] = arr.slice(-13);
  }
  return result;
}

// ── Reducer ─────────────────────────────────────

export function demoReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // ── Navigation ────────────────────────────
    case 'SELECT_LOCATION':
      return { ...state, selectedLocationId: action.locationId };

    case 'SET_MAP_LAYER':
      return { ...state, activeMapLayer: action.layer };

    case 'SET_TREND_METRIC':
      return { ...state, activeTrendMetric: action.metric };

    case 'SET_COMPARISON_SORT':
      return { ...state, comparisonSort: action.sortKey };

    // ── Scenario switch ──────────────────────
    case 'SET_SCENARIO': {
      const newScenario = action.scenario;
      const step = 0;
      return {
        ...state,
        scenario: newScenario,
        simulationStep: step,
        simulationTimestamp: stepToTimestamp(step),
        isPlaying: false,
        readingsByLocation: generateAllReadings(newScenario, step),
        historyByLocation: generateHistory(newScenario, step),
      };
    }

    // ── Simulation control ───────────────────
    case 'TICK':
    case 'STEP': {
      const nextStep = state.simulationStep + 1;
      const newReadings = generateAllReadings(state.scenario, nextStep);
      return {
        ...state,
        simulationStep: nextStep,
        simulationTimestamp: stepToTimestamp(nextStep),
        readingsByLocation: newReadings,
        historyByLocation: appendHistory(state.historyByLocation, newReadings),
      };
    }

    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
}
