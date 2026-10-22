// ──────────────────────────────────────────────
// Urban Health Monitoring System – Alerts Panel
// ──────────────────────────────────────────────

import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useDemoState, useDemoDispatch } from '../state/DemoProvider';
import { LOCATIONS, LOCATION_MAP } from '../data/locations';
import { computeDerivedReading } from '../utils/analytics';
import { ALERT_THRESHOLDS } from '../config/thresholds';

export const AlertsPanel: React.FC = () => {
  const { readingsByLocation, selectedLocationId } = useDemoState();
  const dispatch = useDemoDispatch();

  // Compute alerts for all locations
  const alertsList = LOCATIONS.map((loc) => {
    const reading = readingsByLocation[loc.id];
    if (!reading) return null;
    const derived = computeDerivedReading(reading);
    return {
      location: loc,
      reading,
      derived,
      hasAlert: derived.alertReasons.length > 0,
    };
  })
    .filter((item): item is NonNullable<typeof item> => item !== null && item.hasAlert)
    .sort((a, b) => {
      // Sort by stress score descending, then AQI descending
      if (b.derived.urbanStressIndex !== a.derived.urbanStressIndex) {
        return b.derived.urbanStressIndex - a.derived.urbanStressIndex;
      }
      return b.reading.aqi - a.reading.aqi;
    });

  return (
    <div className="alerts-card">
      <div className="alerts-header">
        <AlertTriangle size={18} color="#FF9800" />
        <h3 className="alerts-title">Active Demo Alerts</h3>
        <span
          title={`Triggers: AQI ≥ ${ALERT_THRESHOLDS.aqi}, Noise LAeq ≥ ${ALERT_THRESHOLDS.noise} dB(A), Stress Index ≥ ${ALERT_THRESHOLDS.stress}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            color: '#536872',
            cursor: 'help',
            marginLeft: 'auto',
          }}
        >
          <Info size={13} />
          Demo alert thresholds
        </span>
      </div>

      <div className="alerts-subtitle">
        Triggers: AQI &ge; {ALERT_THRESHOLDS.aqi} &bull; Noise &ge; {ALERT_THRESHOLDS.noise} dB(A) &bull; Stress &ge; {ALERT_THRESHOLDS.stress}
      </div>

      {alertsList.length === 0 ? (
        <div className="no-alerts">
          <CheckCircle size={20} color="#4CAF50" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />
          No active demo alerts across monitored locations
        </div>
      ) : (
        <div>
          {alertsList.map(({ location, reading, derived }) => {
            const isSelected = location.id === selectedLocationId;
            return (
              <div
                key={location.id}
                className="alert-item"
                style={{
                  cursor: 'pointer',
                  borderColor: isSelected ? '#0F766E' : '#FF9800',
                  background: isSelected ? '#E6F4F1' : '#FFF9F5',
                }}
                onClick={() => dispatch({ type: 'SELECT_LOCATION', locationId: location.id })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    dispatch({ type: 'SELECT_LOCATION', locationId: location.id });
                  }
                }}
              >
                <div className="alert-location">
                  {location.name}{' '}
                  <span style={{ fontSize: 11, color: '#536872', fontWeight: 'normal' }}>
                    ({location.stationLabel})
                  </span>
                </div>
                <div className="alert-reasons">
                  <strong>Triggered conditions:</strong>
                  <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                    {derived.alertReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                  <div style={{ marginTop: 4, fontSize: 12, color: '#536872' }}>
                    Summary: AQI {Math.round(reading.aqi)} ({derived.aqiCategory}), noise{' '}
                    {reading.noiseLAeqDbA.toFixed(1)} dB(A), demo stress{' '}
                    {derived.urbanStressIndex}/100.
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
