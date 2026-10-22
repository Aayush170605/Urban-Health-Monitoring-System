// ──────────────────────────────────────────────
// Urban Health Monitoring System – Demo Reducer
// ──────────────────────────────────────────────

import { AppState, AppAction, LocationId } from '../types';
import {
  generateAllReadings,
  generateHistory,
  stepToTimestamp,
} from '../services/demoDataProvider';

const JAM_CYCLE_ORDER: LocationId[] = [
  'bagalur-cross',
  'galleria-mall',
  'phoenix-mall',
  'hebbal-flyover',
];

// ── Defaults ────────────────────────────────────

/**
 * Build the initial application state.
 * Starts at baseline, step 0 (09:00 IST), paused, with Bagalur Cross (worst hotspot) selected.
 */
export function createInitialState(): AppState {
  const scenario = 'baseline' as const;
  const step = 0;
  const jamLoc: LocationId = 'bagalur-cross';

  return {
    selectedLocationId: 'bagalur-cross',
    activeJamLocationId: jamLoc,
    commuterCycle: 1,
    activeMapLayer: 'aqi',
    activeTrendMetric: 'aqi',
    scenario,
    simulationStep: step,
    simulationTimestamp: stepToTimestamp(step),
    isPlaying: false,
    readingsByLocation: generateAllReadings(scenario, step, undefined, jamLoc),
    historyByLocation: generateHistory(scenario, step, undefined, jamLoc),
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

    case 'SET_JAM_LOCATION': {
      const jamLoc = action.locationId;
      return {
        ...state,
        activeJamLocationId: jamLoc,
        selectedLocationId: jamLoc, // auto-select newly jammed hotspot for inspection
        readingsByLocation: generateAllReadings(
          state.scenario,
          state.simulationStep,
          undefined,
          jamLoc,
        ),
        historyByLocation: generateHistory(
          state.scenario,
          state.simulationStep,
          undefined,
          jamLoc,
        ),
      };
    }

    case 'NEXT_COMMUTE_CYCLE': {
      const currentIdx = JAM_CYCLE_ORDER.indexOf(state.activeJamLocationId);
      const nextIdx = (currentIdx + 1) % JAM_CYCLE_ORDER.length;
      const nextJam = JAM_CYCLE_ORDER[nextIdx];
      const nextCycle = state.commuterCycle + 1;

      return {
        ...state,
        activeJamLocationId: nextJam,
        commuterCycle: nextCycle,
        selectedLocationId: nextJam,
        readingsByLocation: generateAllReadings(
          state.scenario,
          state.simulationStep,
          undefined,
          nextJam,
        ),
        historyByLocation: generateHistory(
          state.scenario,
          state.simulationStep,
          undefined,
          nextJam,
        ),
      };
    }

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
        readingsByLocation: generateAllReadings(
          newScenario,
          step,
          undefined,
          state.activeJamLocationId,
        ),
        historyByLocation: generateHistory(
          newScenario,
          step,
          undefined,
          state.activeJamLocationId,
        ),
      };
    }

    // ── Simulation control ───────────────────
    case 'TICK':
    case 'STEP': {
      const nextStep = state.simulationStep + 1;
      const newReadings = generateAllReadings(
        state.scenario,
        nextStep,
        undefined,
        state.activeJamLocationId,
      );
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
