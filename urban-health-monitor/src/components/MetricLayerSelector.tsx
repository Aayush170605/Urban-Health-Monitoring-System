// ──────────────────────────────────────────────
// Urban Health Monitoring System – Metric Layer Selector
// ──────────────────────────────────────────────

import React from 'react';
import { MapLayer } from '../types';
import { useDemoState, useDemoDispatch } from '../state/DemoProvider';
import { MAP_LAYER_OPTIONS } from '../config/metrics';

const MetricLayerSelector: React.FC = () => {
  const { activeMapLayer } = useDemoState();
  const dispatch = useDemoDispatch();

  return (
    <div
      role="tablist"
      aria-label="Map metric layer"
      style={{
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {MAP_LAYER_OPTIONS.map((opt) => {
        const isActive = activeMapLayer === opt.value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isActive}
            onClick={() =>
              dispatch({ type: 'SET_MAP_LAYER', layer: opt.value })
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 34,
              padding: '0 16px',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'inherit',
              border: 'none',
              borderRadius: 20,
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
              background: isActive ? '#0F766E' : 'transparent',
              color: isActive ? '#FFFFFF' : '#536872',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  '#DFF3EF';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'transparent';
              }
            }}
            onFocus={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  '#DFF3EF';
              }
            }}
            onBlur={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'transparent';
              }
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default MetricLayerSelector;
