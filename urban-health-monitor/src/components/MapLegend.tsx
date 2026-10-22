// ──────────────────────────────────────────────
// Urban Health Monitoring System – Map Legend
// ──────────────────────────────────────────────

import React from 'react';
import { useDemoState } from '../state/DemoProvider';
import { AQI_CATEGORIES, BAND_LOOKUP, BAND_COLORS } from '../config/thresholds';
import { MAP_LAYER_CONFIGS } from '../config/metrics';
import { MapLayer } from '../types';

const swatchStyle: React.CSSProperties = {
  display: 'inline-block',
  width: 14,
  height: 14,
  borderRadius: 3,
  flexShrink: 0,
};

const MapLegend: React.FC = () => {
  const { activeMapLayer } = useDemoState();
  const layerConfig = MAP_LAYER_CONFIGS[activeMapLayer];

  if (activeMapLayer === 'aqi') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#536872',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
          }}
        >
          AQI Categories
        </span>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {AQI_CATEGORIES.map((cat) => (
            <div
              key={cat.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span style={{ ...swatchStyle, background: cat.color }} />
              <span style={{ fontSize: 11, color: '#536872', whiteSpace: 'nowrap' }}>
                {cat.label} ({cat.min}–{cat.max})
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Band-based layers
  const bandKey = activeMapLayer as 'noise' | 'pm25' | 'pm10' | 'traffic' | 'stress';
  const bands = BAND_LOOKUP[bandKey];
  const unit = layerConfig.unit;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#536872',
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}
      >
        Demo display bands — {layerConfig.label}
      </span>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {bands.map((band) => {
          const rangeLabel =
            band.max === Infinity
              ? `≥ ${band.min}${unit ? ' ' + unit : ''}`
              : `${band.min}–${band.max}${unit ? ' ' + unit : ''}`;
          return (
            <div
              key={band.label}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <span style={{ ...swatchStyle, background: band.color }} />
              <span
                style={{
                  fontSize: 11,
                  color: '#536872',
                  whiteSpace: 'nowrap',
                }}
              >
                {band.label} ({rangeLabel})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MapLegend;
