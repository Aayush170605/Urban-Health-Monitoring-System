// ──────────────────────────────────────────────
// Urban Health Monitoring System – Demo Controls
// ──────────────────────────────────────────────

import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';
import { Scenario } from '../types';
import { useDemoState, useDemoDispatch } from '../state/DemoProvider';
import { formatTimestamp, formatScenarioName } from '../utils/formatting';

const btnBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  height: 38,
  padding: '0 14px',
  fontSize: 13,
  fontWeight: 500,
  fontFamily: 'Inter, system-ui, sans-serif',
  border: '1px solid #DCE5E8',
  borderRadius: 8,
  background: '#FFFFFF',
  color: '#162C36',
  cursor: 'pointer',
  transition: 'background 0.15s',
  whiteSpace: 'nowrap' as const,
};

const scenarios: { value: Scenario; label: string }[] = [
  { value: 'baseline', label: 'Baseline' },
  { value: 'rush-hour', label: 'Rush hour' },
  { value: 'improved', label: 'Improved conditions' },
];

const DemoControls: React.FC = () => {
  const state = useDemoState();
  const dispatch = useDemoDispatch();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 24px',
        background: '#FFFFFF',
        borderRadius: 14,
        border: '1px solid #DCE5E8',
        fontFamily: 'Inter, system-ui, sans-serif',
        flexWrap: 'wrap',
      }}
    >
      {/* Scenario selector */}
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 500,
          color: '#536872',
        }}
      >
        Scenario
        <select
          value={state.scenario}
          onChange={(e) =>
            dispatch({
              type: 'SET_SCENARIO',
              scenario: e.target.value as Scenario,
            })
          }
          style={{
            height: 38,
            padding: '0 12px',
            fontSize: 13,
            fontFamily: 'inherit',
            border: '1px solid #DCE5E8',
            borderRadius: 8,
            background: '#FFFFFF',
            color: '#162C36',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {scenarios.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 24,
          background: '#DCE5E8',
          flexShrink: 0,
        }}
      />

      {/* Play/Pause */}
      <button
        style={{
          ...btnBase,
          background: state.isPlaying ? '#0F766E' : '#FFFFFF',
          color: state.isPlaying ? '#FFFFFF' : '#162C36',
          borderColor: state.isPlaying ? '#0F766E' : '#DCE5E8',
        }}
        onClick={() => dispatch({ type: 'TOGGLE_PLAY' })}
        aria-label={state.isPlaying ? 'Pause simulation' : 'Start simulation'}
        title={state.isPlaying ? 'Pause simulation' : 'Start simulation'}
      >
        {state.isPlaying ? <Pause size={15} /> : <Play size={15} />}
        {state.isPlaying ? 'Pause' : 'Start'}
      </button>

      {/* Step */}
      <button
        style={{
          ...btnBase,
          opacity: state.isPlaying ? 0.4 : 1,
          pointerEvents: state.isPlaying ? 'none' : 'auto',
        }}
        onClick={() => dispatch({ type: 'STEP' })}
        disabled={state.isPlaying}
        aria-label="Step forward one tick"
        title="Step forward (+5 simulated minutes)"
      >
        <SkipForward size={15} />
        Step
      </button>

      {/* Reset */}
      <button
        style={btnBase}
        onClick={() => dispatch({ type: 'RESET' })}
        aria-label="Reset simulation"
        title="Reset to beginning"
      >
        <RotateCcw size={15} />
        Reset
      </button>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 24,
          background: '#DCE5E8',
          flexShrink: 0,
        }}
      />

      {/* Simulated time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#536872', fontWeight: 500 }}>
          Sim. time
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#162C36',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatTimestamp(state.simulationTimestamp)}
        </span>
      </div>

      {/* Status dot + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: state.isPlaying ? '#4CAF50' : '#FF9800',
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 12, color: '#536872' }}>
          {state.isPlaying ? 'Running simulation' : 'Paused'}
        </span>
      </div>

      {/* Help tooltip */}
      <div
        style={{ position: 'relative', display: 'inline-flex' }}
        title="5 seconds of real time = 5 simulated minutes"
      >
        <HelpCircle size={16} style={{ color: '#536872', cursor: 'help' }} />
      </div>
    </div>
  );
};

export default DemoControls;
