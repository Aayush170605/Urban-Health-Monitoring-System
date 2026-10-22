// ──────────────────────────────────────────────
// Urban Health Monitoring System – Location Details
// ──────────────────────────────────────────────

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, AlertTriangle } from 'lucide-react';
import { useDemoState } from '../state/DemoProvider';
import { LOCATION_MAP } from '../data/locations';
import {
  computeDerivedReading,
  getAqiColor,
  getAqiTextColor,
  getBandColor,
} from '../utils/analytics';
import { formatTimestamp, formatValue } from '../utils/formatting';
import StressBreakdown from './StressBreakdown';

export const LocationDetails: React.FC = () => {
  const { selectedLocationId, readingsByLocation } = useDemoState();
  const [showMoreAcoustics, setShowMoreAcoustics] = useState(false);
  const [showScoreExpl, setShowScoreExpl] = useState(false);

  const location = LOCATION_MAP[selectedLocationId];
  const reading = readingsByLocation[selectedLocationId];

  if (!location || !reading) {
    return (
      <div className="detail-panel">
        <p style={{ color: '#536872' }}>No location selected or data unavailable.</p>
      </div>
    );
  }

  const derived = computeDerivedReading(reading);
  const aqiColor = getAqiColor(reading.aqi);
  const aqiTextColor = getAqiTextColor(reading.aqi);
  const stressColor = getBandColor(derived.stressCategory);

  return (
    <div className="detail-panel">
      {/* Header Info */}
      <div className="detail-header">
        <div className="detail-meta">
          <span className="detail-tag">{location.stationLabel}</span>
          <span className="detail-tag">{location.type}</span>
          <span className="detail-tag simulated">Simulated source</span>
        </div>
        <h2 className="detail-location-name">{location.name}</h2>
        <div className="detail-timestamp">{formatTimestamp(reading.timestamp)}</div>
      </div>

      {/* Alerts for this location if any */}
      {derived.alertReasons.length > 0 && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            color: '#991B1B',
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Active Demo Alert:</strong>
            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
              {derived.alertReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Primary Reading: AQI */}
      <div className="primary-reading">
        <div className="reading-big-label">Air Quality Index (simulated)</div>
        <div className="reading-big-row">
          <span className="reading-big-value" style={{ color: aqiColor }}>
            {Math.round(reading.aqi)}
          </span>
          <span
            className="aqi-badge"
            style={{ backgroundColor: aqiColor, color: aqiTextColor }}
          >
            {derived.aqiCategory}
          </span>
        </div>
      </div>

      {/* Particulate & Noise Grid */}
      <div className="readings-grid">
        <div className="reading-cell">
          <span className="reading-cell-label">PM2.5</span>
          <span className="reading-cell-value">
            {formatValue(reading.pm25UgM3, 1)}{' '}
            <span className="reading-cell-unit">µg/m³</span>
          </span>
        </div>
        <div className="reading-cell">
          <span className="reading-cell-label">PM10</span>
          <span className="reading-cell-value">
            {formatValue(reading.pm10UgM3, 1)}{' '}
            <span className="reading-cell-unit">µg/m³</span>
          </span>
        </div>
        <div className="reading-cell" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="reading-cell-label">Noise</span>
            <span className="reading-cell-subtitle">LAeq, 1 min</span>
          </div>
          <span className="reading-cell-value">
            {formatValue(reading.noiseLAeqDbA, 1)}{' '}
            <span className="reading-cell-unit">dB(A)</span>
          </span>
        </div>
      </div>

      {/* Urban Stress Index Bar */}
      <div className="stress-bar-container">
        <div className="stress-bar-header">
          <span className="stress-bar-label">
            Urban Stress Index <span className="demo-label">Demo</span>
          </span>
          <span className="stress-bar-value" style={{ color: stressColor }}>
            {derived.urbanStressIndex} / 100 • {derived.stressCategory}
          </span>
        </div>
        <div className="stress-bar-track">
          <div
            className="stress-bar-fill"
            style={{
              width: `${derived.urbanStressIndex}%`,
              backgroundColor: stressColor,
            }}
          />
        </div>
        <div className="stress-bar-ticks">
          <span>0 Low</span>
          <span>40 Elevated</span>
          <span>70 High</span>
          <span>100</span>
        </div>
      </div>

      {/* Disclosure: How is this score calculated? */}
      <div>
        <button
          className="expandable-toggle"
          onClick={() => setShowScoreExpl(!showScoreExpl)}
          aria-expanded={showScoreExpl}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Info size={14} /> How is this score calculated?
          </span>
          {showScoreExpl ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showScoreExpl && (
          <StressBreakdown
            componentScores={derived.componentScores}
            weightedContributions={derived.weightedContributions}
            urbanStressIndex={derived.urbanStressIndex}
          />
        )}
      </div>

      <hr className="detail-divider" />

      {/* Traffic Summary */}
      <div>
        <div className="detail-section-title">Traffic Context (Observed Last Minute)</div>
        <div className="readings-grid">
          <div className="reading-cell">
            <span className="reading-cell-label">Traffic Flow</span>
            <span className="reading-cell-value">
              {reading.vehicleCountOneMinute}{' '}
              <span className="reading-cell-unit">veh/min</span>
            </span>
          </div>
          <div className="reading-cell">
            <span className="reading-cell-label">Mean Speed</span>
            <span className="reading-cell-value">
              {formatValue(reading.meanSpeedKmh, 1)}{' '}
              <span className="reading-cell-unit">km/h</span>
            </span>
          </div>
          <div className="reading-cell">
            <span className="reading-cell-label">Queue Length</span>
            <span className="reading-cell-value">
              {reading.queueLengthMetres}{' '}
              <span className="reading-cell-unit">m</span>
            </span>
          </div>
          <div className="reading-cell">
            <span className="reading-cell-label">Avg Waiting Time</span>
            <span className="reading-cell-value">
              {reading.waitingTimeSeconds}{' '}
              <span className="reading-cell-unit">s</span>
            </span>
          </div>
        </div>
      </div>

      <hr className="detail-divider" />

      {/* Weather & Secondary Air */}
      <div>
        <div className="detail-section-title">Weather & Other Air Readings</div>
        <div className="compact-readings">
          <div className="compact-reading">
            <div className="compact-reading-value">{formatValue(reading.temperatureC, 1)}°C</div>
            <div className="compact-reading-label">Temperature</div>
          </div>
          <div className="compact-reading">
            <div className="compact-reading-value">{reading.humidityPercent}%</div>
            <div className="compact-reading-label">Humidity</div>
          </div>
          <div className="compact-reading">
            <div className="compact-reading-value">{formatValue(reading.coMgM3, 1)} mg/m³</div>
            <div className="compact-reading-label">Carbon Monoxide</div>
          </div>
        </div>
      </div>

      {/* Expandable: More acoustic readings */}
      <div>
        <button
          className="expandable-toggle"
          onClick={() => setShowMoreAcoustics(!showMoreAcoustics)}
          aria-expanded={showMoreAcoustics}
        >
          <span>More readings (Acoustic statistics & Honks)</span>
          {showMoreAcoustics ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showMoreAcoustics && (
          <div className="expandable-content">
            <div className="acoustic-detail-row">
              <span className="acoustic-detail-name">Honk Events</span>
              <span className="acoustic-detail-value">{reading.honksPerMinute} events/min</span>
            </div>
            <div className="acoustic-detail-row">
              <span className="acoustic-detail-name">SPL (Instantaneous Sound Pressure)</span>
              <span className="acoustic-detail-value">{formatValue(reading.splDbA, 1)} dB(A)</span>
            </div>
            <div className="acoustic-detail-def">Instantaneous sound pressure level at sample time</div>

            <div className="acoustic-detail-row">
              <span className="acoustic-detail-name">Lmax (Maximum Sound Level)</span>
              <span className="acoustic-detail-value">{formatValue(reading.lmaxDbA, 1)} dB(A)</span>
            </div>
            <div className="acoustic-detail-def">Peak sound level recorded during simulated 1-minute window</div>

            <div className="acoustic-detail-row">
              <span className="acoustic-detail-name">L10 (Acoustic Percentile)</span>
              <span className="acoustic-detail-value">{formatValue(reading.l10DbA, 1)} dB(A)</span>
            </div>
            <div className="acoustic-detail-def">Sound level exceeded for 10% of the observation window</div>

            <div className="acoustic-detail-row">
              <span className="acoustic-detail-name">L90 (Background Noise Floor)</span>
              <span className="acoustic-detail-value">{formatValue(reading.l90DbA, 1)} dB(A)</span>
            </div>
            <div className="acoustic-detail-def">Residual background sound level exceeded 90% of the time</div>

            <div style={{ marginTop: 12, padding: 8, background: '#F4F7F8', borderRadius: 6, fontSize: 11, color: '#536872' }}>
              <strong>Additional parameters capability:</strong>
              <div>&bull; NO₂: <span style={{ fontStyle: 'italic' }}>Not included in this demo</span></div>
              <div>&bull; VOCs: <span style={{ fontStyle: 'italic' }}>Not included in this demo</span></div>
              <div>&bull; Wind Speed & Direction: <span style={{ fontStyle: 'italic' }}>Not included in this demo</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationDetails;
