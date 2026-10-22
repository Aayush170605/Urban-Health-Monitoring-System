// ──────────────────────────────────────────────
// Urban Health Monitoring System – Comparison Table
// ──────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import { Download, AlertTriangle, CheckCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { LocationId, ComparisonSortKey } from '../types';
import { useDemoState, useDemoDispatch } from '../state/DemoProvider';
import { LOCATIONS } from '../data/locations';
import {
  computeDerivedReading,
  getAqiColor,
  getAqiTextColor,
  getBandColor,
} from '../utils/analytics';
import { downloadCsv } from '../utils/exportCsv';
import { formatValue } from '../utils/formatting';

export const ComparisonTable: React.FC = () => {
  const {
    readingsByLocation,
    selectedLocationId,
    scenario,
    simulationTimestamp,
    comparisonSort,
  } = useDemoState();
  const dispatch = useDemoDispatch();

  // Local sort direction: asc vs desc
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const handleSort = (key: 'aqi' | 'noise' | 'stress') => {
    if (comparisonSort === key) {
      // Toggle direction
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      dispatch({ type: 'SET_COMPARISON_SORT', sortKey: key });
      setSortDirection('desc'); // Default to descending (highest first)
    }
  };

  const tableData = useMemo(() => {
    const list = LOCATIONS.map((loc) => {
      const reading = readingsByLocation[loc.id];
      const derived = reading ? computeDerivedReading(reading) : null;
      return {
        location: loc,
        reading,
        derived,
      };
    });

    if (comparisonSort === 'default') {
      return list;
    }

    return [...list].sort((a, b) => {
      if (!a.reading || !b.reading || !a.derived || !b.derived) return 0;
      let valA = 0;
      let valB = 0;

      if (comparisonSort === 'aqi') {
        valA = a.reading.aqi;
        valB = b.reading.aqi;
      } else if (comparisonSort === 'noise') {
        valA = a.reading.noiseLAeqDbA;
        valB = b.reading.noiseLAeqDbA;
      } else if (comparisonSort === 'stress') {
        valA = a.derived.urbanStressIndex;
        valB = b.derived.urbanStressIndex;
      }

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [readingsByLocation, comparisonSort, sortDirection]);

  const handleExport = () => {
    try {
      downloadCsv(readingsByLocation, scenario, simulationTimestamp);
      setExportStatus('CSV exported successfully!');
      setTimeout(() => setExportStatus(null), 3000);
    } catch {
      setExportStatus('Failed to generate CSV export.');
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  const renderSortIcon = (key: 'aqi' | 'noise' | 'stress') => {
    if (comparisonSort !== key) {
      return <ArrowUpDown size={12} className="sort-indicator" style={{ opacity: 0.4 }} />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="sort-indicator" style={{ color: '#0F766E' }} />
    ) : (
      <ArrowDown size={12} className="sort-indicator" style={{ color: '#0F766E' }} />
    );
  };

  return (
    <div className="comparison-card">
      <div className="comparison-header">
        <div>
          <h3 className="comparison-title">Location Comparison (All 4 Hotspots)</h3>
          <span style={{ fontSize: 12, color: '#536872' }}>
            Click any row to select location on map. Column headers sort table without changing map positions.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {exportStatus && (
            <span style={{ fontSize: 12, color: exportStatus.includes('success') ? '#0F766E' : '#B91C1C' }}>
              {exportStatus}
            </span>
          )}
          <button
            onClick={handleExport}
            className="export-btn"
            title="Download CSV of current readings across all 4 locations"
          >
            <Download size={15} />
            Export current readings
          </button>
        </div>
      </div>

      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Location</th>
              <th className="sortable" onClick={() => handleSort('aqi')} title="Click to sort by AQI">
                AQI / Category {renderSortIcon('aqi')}
              </th>
              <th>PM2.5 (µg/m³)</th>
              <th>PM10 (µg/m³)</th>
              <th className="sortable" onClick={() => handleSort('noise')} title="Click to sort by Noise">
                Noise (dB(A)) {renderSortIcon('noise')}
              </th>
              <th>Queue (m)</th>
              <th className="sortable" onClick={() => handleSort('stress')} title="Click to sort by Urban Stress Index">
                Stress (0-100) {renderSortIcon('stress')}
              </th>
              <th style={{ textAlign: 'center' }}>Alerts</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map(({ location, reading, derived }) => {
              const isSelected = location.id === selectedLocationId;
              const aqiVal = reading ? Math.round(reading.aqi) : 0;
              const aqiColor = getAqiColor(aqiVal);
              const aqiTextColor = getAqiTextColor(aqiVal);
              const stressVal = derived ? derived.urbanStressIndex : 0;
              const stressColor = derived ? getBandColor(derived.stressCategory) : '#999';
              const hasAlerts = derived && derived.alertReasons.length > 0;

              return (
                <tr
                  key={location.id}
                  className={isSelected ? 'selected' : ''}
                  onClick={() => dispatch({ type: 'SELECT_LOCATION', locationId: location.id })}
                >
                  <td className="table-location-name">
                    <div style={{ fontWeight: 600, color: isSelected ? '#0F766E' : '#162C36' }}>
                      {location.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#536872' }}>
                      {location.stationLabel} &bull; {location.type}
                    </div>
                  </td>
                  <td>
                    {reading && derived ? (
                      <div className="table-aqi-cell">
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{aqiVal}</span>
                        <span
                          className="table-aqi-badge"
                          style={{ backgroundColor: aqiColor, color: aqiTextColor }}
                        >
                          {derived.aqiCategory}
                        </span>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{reading ? formatValue(reading.pm25UgM3, 1) : '—'}</td>
                  <td>{reading ? formatValue(reading.pm10UgM3, 1) : '—'}</td>
                  <td>{reading ? formatValue(reading.noiseLAeqDbA, 1) : '—'}</td>
                  <td>{reading ? reading.queueLengthMetres : '—'}</td>
                  <td>
                    {derived ? (
                      <span style={{ fontWeight: 600, color: stressColor }}>
                        {stressVal}/100 ({derived.stressCategory})
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {hasAlerts ? (
                      <span
                        className="table-alert-icon"
                        title={derived?.alertReasons.join('; ')}
                        style={{ color: '#DC2626' }}
                      >
                        <AlertTriangle size={16} />
                      </span>
                    ) : (
                      <span className="table-alert-icon" style={{ color: '#16A34A' }}>
                        <CheckCircle size={16} />
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
